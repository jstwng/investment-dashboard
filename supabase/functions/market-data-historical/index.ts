import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { callFmp, FmpError } from '../_shared/fmpClient.ts'
import { getCachedOrFetch, TTL } from '../_shared/cacheHelper.ts'
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts'

interface HistoricalBody {
  symbol: string
  from?: string   // YYYY-MM-DD
  to?: string     // YYYY-MM-DD
}

interface FmpHistoricalResponse {
  symbol: string
  historical: Array<{
    date: string
    open: number
    high: number
    low: number
    close: number
    adjClose: number
    volume: number
    unadjustedVolume: number
    change: number
    changePercent: number
    vwap: number
    label: string
    changeOverTime: number
  }>
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
    const body = (await req.json().catch(() => ({}))) as HistoricalBody
    const symbol = body.symbol?.trim().toUpperCase()
    if (!symbol) return errorResponse('Missing "symbol" parameter', 400)

    const params: Record<string, string> = {}
    if (body.from) params.from = body.from
    if (body.to) params.to = body.to

    // Cache key includes date range
    const cacheKey = `fmp:historical:${symbol}:${body.from ?? ''}:${body.to ?? ''}`
    const results = await getCachedOrFetch<FmpHistoricalResponse>(
      cacheKey,
      TTL.HISTORICAL,
      'fmp',
      () => callFmp<FmpHistoricalResponse>(`/historical-price-full/${symbol}`, params),
    )

    return jsonResponse(results)
  } catch (err) {
    const message = err instanceof FmpError
      ? `FMP error (${err.statusCode}): ${err.message}`
      : err instanceof Error ? err.message : 'Internal error'
    return errorResponse(message)
  }
})
