import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { callSnaptrade, SnapTradeError } from '../_shared/snaptradeClient.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ---------------------------------------------------------------------------
// SnapTrade response type shapes
// ---------------------------------------------------------------------------

interface SnapTradeAccountType {
  name: string
}

interface SnapTradeAccount {
  id: string
  name: string
  number: string
  institution_name: string
  type?: SnapTradeAccountType
  status: string
}

interface SnapTradeSymbolType {
  description: string
}

interface SnapTradeSymbol {
  id: string
  symbol: string
  description: string
  type?: SnapTradeSymbolType
}

interface SnapTradePosition {
  symbol: SnapTradeSymbol
  units: number | null
  fractional_units: number | null
  price: number
  open_pnl: number | null
  average_purchase_price: number | null
}

interface SnapTradeHoldingsResponse {
  account: unknown
  balances: unknown[]
  positions: SnapTradePosition[]
  total_value: unknown
}

interface SnapTradeCurrency {
  code: string
}

interface SnapTradeBalance {
  currency: SnapTradeCurrency
  cash: number
}

// ---------------------------------------------------------------------------
// POST body
// ---------------------------------------------------------------------------

interface SyncBody {
  account_id?: string
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders })
  }

  try {
    // ── JWT validation ─────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

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

    // ── Parse optional POST body ───────────────────────────────────────────
    const body = (await req.json().catch(() => ({}))) as SyncBody
    const filterAccountId = body.account_id ?? null

    // ── Service role client for all DB operations ──────────────────────────
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // ── Fetch SnapTrade user credentials from DB (service role) ───────────
    const { data: snapUser, error: snapUserError } = await serviceClient
      .from('snaptrade_users')
      .select('snaptrade_user_id, snaptrade_user_secret')
      .eq('user_id', user.id)
      .maybeSingle()

    if (snapUserError) {
      throw new Error(`Failed to fetch SnapTrade credentials: ${snapUserError.message}`)
    }
    if (!snapUser) {
      return new Response(JSON.stringify({ error: 'SnapTrade user not registered' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { snaptrade_user_id: snaptradeUserId, snaptrade_user_secret: snaptradeUserSecret } = snapUser

    // ── GET /accounts — list all brokerage accounts for this user ─────────
    const allAccounts = await callSnaptrade<SnapTradeAccount[]>(
      '/accounts',
      'GET',
      undefined,
      snaptradeUserId,
      snaptradeUserSecret,
    )

    // Apply optional single-account filter
    const accountsToSync = filterAccountId
      ? allAccounts.filter((a) => a.id === filterAccountId)
      : allAccounts

    if (accountsToSync.length === 0) {
      return new Response(
        JSON.stringify({ synced_accounts: 0, holdings_count: 0, last_synced_at: new Date().toISOString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const syncedAt = new Date().toISOString()
    let totalHoldings = 0

    for (const account of accountsToSync) {
      // ── Upsert account into snaptrade_accounts ─────────────────────────
      const { data: upsertedAccounts, error: upsertError } = await serviceClient
        .from('snaptrade_accounts')
        .upsert(
          {
            user_id: user.id,
            snaptrade_account_id: account.id,
            account_name: account.name,
            account_number: account.number,
            institution_name: account.institution_name,
            account_type: account.type?.name ?? null,
            status: 'active',
          },
          { onConflict: 'snaptrade_account_id' },
        )
        .select('id')

      if (upsertError) {
        throw new Error(`Failed to upsert account ${account.id}: ${upsertError.message}`)
      }

      // Resolve the DB uuid for this account
      const dbAccountId: string = (upsertedAccounts as Array<{ id: string }>)[0].id

      // ── GET /accounts/{id}/holdings ────────────────────────────────────
      const holdingsResp = await callSnaptrade<SnapTradeHoldingsResponse>(
        `/accounts/${account.id}/holdings`,
        'GET',
        undefined,
        snaptradeUserId,
        snaptradeUserSecret,
      )

      const positions = holdingsResp.positions ?? []

      // Delete existing holdings for this account (delete-then-insert)
      const { error: deleteError } = await serviceClient
        .from('investment_holdings')
        .delete()
        .eq('snaptrade_account_id', dbAccountId)

      if (deleteError) {
        throw new Error(`Failed to delete holdings for account ${account.id}: ${deleteError.message}`)
      }

      // Insert fresh holdings rows
      if (positions.length > 0) {
        const holdingRows = positions.map((position) => {
          const quantity = (position.units ?? 0) + (position.fractional_units ?? 0)
          return {
            user_id: user.id,
            snaptrade_account_id: dbAccountId,
            external_account_id: account.id,
            snaptrade_symbol_id: position.symbol.id,
            ticker_symbol: position.symbol.symbol,
            security_name: position.symbol.description,
            security_type: position.symbol.type?.description ?? null,
            quantity,
            average_purchase_price: position.average_purchase_price,
            institution_price: position.price,
            institution_value: quantity * position.price,
            open_pnl: position.open_pnl,
            iso_currency_code: 'USD',
          }
        })

        const { error: insertError } = await serviceClient
          .from('investment_holdings')
          .insert(holdingRows)

        if (insertError) {
          throw new Error(`Failed to insert holdings for account ${account.id}: ${insertError.message}`)
        }

        totalHoldings += holdingRows.length
      }

      // ── GET /accounts/{id}/balances — sum USD cash balances ───────────
      const balances = await callSnaptrade<SnapTradeBalance[]>(
        `/accounts/${account.id}/balances`,
        'GET',
        undefined,
        snaptradeUserId,
        snaptradeUserSecret,
      )

      const cashBalance = (balances ?? [])
        .filter((b) => b.currency?.code === 'USD')
        .reduce((sum, b) => sum + (b.cash ?? 0), 0)

      // Update cash_balance + last_synced_at on the account row
      const { error: updateError } = await serviceClient
        .from('snaptrade_accounts')
        .update({ cash_balance: cashBalance, last_synced_at: syncedAt })
        .eq('id', dbAccountId)

      if (updateError) {
        throw new Error(`Failed to update cash balance for account ${account.id}: ${updateError.message}`)
      }
    }

    return new Response(
      JSON.stringify({
        synced_accounts: accountsToSync.length,
        holdings_count: totalHoldings,
        last_synced_at: syncedAt,
      }),
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
