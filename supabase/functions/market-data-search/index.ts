import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { callFmp, FmpError } from '../_shared/fmpClient.ts'
import { getCachedOrFetch, TTL } from '../_shared/cacheHelper.ts'
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'

interface FmpSearchResult {
  symbol: string
  name: string
  currency: string
  stockExchange: string
  exchangeShortName: string
}

interface SearchBody {
  query: string
  limit?: number
  exchange?: string
}

Deno.serve(async (req) => {
  const corsResp = handleCors(req)
  if (corsResp) return corsResp

  try {
    // JWT validation
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return errorResponse('Missing Authorization header', 401)

    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: userError } = await anonClient.auth.getUser()
    if (userError || !user) return errorResponse('Unauthorized', 401)

    // Parse request
    const body = (await req.json().catch(() => ({}))) as SearchBody
    const query = body.query?.trim()
    if (!query) return errorResponse('Missing "query" parameter', 400)

    const limit = String(body.limit ?? 10)
    const exchange = body.exchange ?? ''

    // Fetch with caching
    const cacheKey = `fmp:search:${query.toLowerCase()}:${exchange}:${limit}`
    const results = await getCachedOrFetch<FmpSearchResult[]>(
      cacheKey,
      TTL.SEARCH,
      'fmp',
      () => callFmp<FmpSearchResult[]>('/search', {
        query,
        limit,
        ...(exchange && { exchange }),
      }),
    )

    return jsonResponse(results)
  } catch (err) {
    const message = err instanceof FmpError
      ? `FMP error (${err.statusCode}): ${err.message}`
      : err instanceof Error ? err.message : 'Internal error'
    return errorResponse(message)
  }
})
