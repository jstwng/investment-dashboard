import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { callSnaptrade, SnapTradeError } from '../_shared/snaptradeClient.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RegisterUserResponse {
  userId: string
  userSecret: string
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

    // Service role client — used for all DB operations
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Idempotency check: return existing registration if already registered
    const { data: existingRow, error: selectError } = await serviceClient
      .from('snaptrade_users')
      .select('snaptrade_user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (selectError) {
      throw new Error(`DB lookup failed: ${selectError.message}`)
    }

    if (existingRow) {
      return new Response(
        JSON.stringify({ snaptrade_user_id: existingRow.snaptrade_user_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Not yet registered — call SnapTrade registration endpoint.
    // userId/userSecret query params are omitted (undefined) for this
    // registration call since the user does not exist on SnapTrade yet.
    const snapResponse = await callSnaptrade<RegisterUserResponse>(
      '/snapTrade/registerUser',
      'POST',
      { userId: user.id },
      undefined,
      undefined,
    )

    // Persist credentials using service role (bypasses RLS)
    const { error: insertError } = await serviceClient
      .from('snaptrade_users')
      .insert({
        user_id: user.id,
        snaptrade_user_id: snapResponse.userId,
        snaptrade_user_secret: snapResponse.userSecret,
      })

    if (insertError) {
      throw new Error(`DB insert failed: ${insertError.message}`)
    }

    // Return only the public-facing user ID — never expose userSecret
    return new Response(
      JSON.stringify({ snaptrade_user_id: snapResponse.userId }),
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
