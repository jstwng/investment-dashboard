import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { callSnaptrade, SnapTradeError } from '../_shared/snaptradeClient.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SyncBody {
  account_id: string   // snaptrade_account_id string (not db uuid)
  start_date: string   // YYYY-MM-DD
  end_date: string     // YYYY-MM-DD
}

interface SnapTradeSymbol {
  id: string
  symbol: string
  description: string
}

interface SnapTradeActivity {
  id: string
  account: string
  amount: number
  currency: string
  date: string
  description: string
  symbol?: SnapTradeSymbol
  price: number
  units: number
  type: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders })
  }

  try {
    // Validate caller JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Anon client scoped to the caller's JWT — used only for getUser()
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: userError } = await anonClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse and validate POST body
    const body = await req.json() as SyncBody
    const { account_id, start_date, end_date } = body

    if (!account_id || !start_date || !end_date) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: account_id, start_date, end_date' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Service role client — used for all DB operations
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Fetch snaptrade credentials for the calling user
    const { data: snapUser, error: snapUserError } = await serviceClient
      .from('snaptrade_users')
      .select('snaptrade_user_id, snaptrade_user_secret')
      .eq('user_id', user.id)
      .maybeSingle()

    if (snapUserError) {
      throw new Error(`DB lookup failed: ${snapUserError.message}`)
    }

    if (!snapUser) {
      return new Response(JSON.stringify({ error: 'SnapTrade user not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { snaptrade_user_id: snaptradeUserId, snaptrade_user_secret: snaptradeUserSecret } = snapUser

    // Look up the snaptrade_accounts row to get the db uuid
    const { data: accountRow, error: accountError } = await serviceClient
      .from('snaptrade_accounts')
      .select('id')
      .eq('snaptrade_account_id', account_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (accountError) {
      throw new Error(`DB lookup failed: ${accountError.message}`)
    }

    if (!accountRow) {
      return new Response(JSON.stringify({ error: 'Account not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const dbAccountUuid: string = accountRow.id

    // Fetch activities from SnapTrade with date range as query params
    const activities = await callSnaptrade<SnapTradeActivity[]>(
      `/accounts/${account_id}/activities?startDate=${start_date}&endDate=${end_date}`,
      'GET',
      undefined,
      snaptradeUserId,
      snaptradeUserSecret,
    )

    // Map SnapTrade activity objects to investment_transactions rows
    const txRows = activities.map((activity) => ({
      user_id: user.id,
      snaptrade_account_id: dbAccountUuid,
      external_account_id: account_id,
      snaptrade_activity_id: activity.id,
      snaptrade_symbol_id: activity.symbol?.id ?? null,
      ticker_symbol: activity.symbol?.symbol ?? null,
      security_name: activity.symbol?.description ?? null,
      transaction_type: activity.type,
      quantity: activity.units,
      price: activity.price,
      amount: activity.amount,
      iso_currency_code: activity.currency ?? 'USD',
      date: activity.date,
      name: activity.description,
    }))

    // Upsert — ignore duplicates keyed on snaptrade_activity_id
    if (txRows.length > 0) {
      const { error: upsertError } = await serviceClient
        .from('investment_transactions')
        .upsert(txRows, { onConflict: 'snaptrade_activity_id', ignoreDuplicates: true })

      if (upsertError) {
        throw new Error(`DB upsert failed: ${upsertError.message}`)
      }
    }

    const lastSyncedAt = new Date().toISOString()

    return new Response(
      JSON.stringify({ transactions_count: txRows.length, last_synced_at: lastSyncedAt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    const message = err instanceof SnapTradeError
      ? `SnapTrade error (${err.errorCode}): ${err.message}`
      : err instanceof Error
      ? err.message
      : 'Internal error'

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
