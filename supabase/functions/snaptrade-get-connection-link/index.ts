import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { callSnaptrade, SnapTradeError } from '../_shared/snaptradeClient.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConnectionLinkBody {
  broker?: string
  reconnect?: string
}

interface SnapTradeLoginResponse {
  redirectURI: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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

    // User-scoped client for JWT validation
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

    // Parse POST body
    const body = await req.json() as ConnectionLinkBody
    const { broker, reconnect } = body

    // Service-role client to read snaptrade_users (bypasses RLS)
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: snaptradeUser, error: dbError } = await serviceClient
      .from('snaptrade_users')
      .select('snaptrade_user_id, snaptrade_user_secret')
      .eq('user_id', user.id)
      .single()

    if (dbError || !snaptradeUser) {
      return new Response(
        JSON.stringify({ error: 'User not registered with SnapTrade. Call snaptrade-register-user first.' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const { snaptrade_user_id: snaptradeUserId, snaptrade_user_secret: snaptradeUserSecret } = snaptradeUser

    // Read redirect URL from environment
    const redirectUrl = Deno.env.get('SNAPTRADE_REDIRECT_URI')

    // Build login body — omit broker/reconnect if not provided
    const loginBody: Record<string, unknown> = {
      immediateRedirect: false,
      ...(redirectUrl !== undefined && { customRedirect: redirectUrl }),
      ...(broker !== undefined && { broker }),
      ...(reconnect !== undefined && { reconnect }),
    }

    const response = await callSnaptrade<SnapTradeLoginResponse>(
      '/snapTrade/login',
      'POST',
      loginBody,
      snaptradeUserId,
      snaptradeUserSecret,
    )

    return new Response(
      JSON.stringify({ redirect_uri: response.redirectURI }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    if (err instanceof SnapTradeError) {
      return new Response(JSON.stringify({ error: err.message, errorCode: err.errorCode }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const message = err instanceof Error ? err.message : 'Internal error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
