/**
 * TTL-based caching using the `api_cache` Supabase table.
 * Requires service-role client (table has no RLS policies for authenticated users).
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

let _serviceClient: SupabaseClient | null = null

function getServiceClient(): SupabaseClient {
  if (!_serviceClient) {
    _serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
  }
  return _serviceClient
}

/**
 * Get cached data or fetch fresh data and cache it.
 *
 * @param cacheKey  - Unique key for this cached item (e.g. "fmp:quote:AAPL")
 * @param ttlMs     - Time-to-live in milliseconds
 * @param provider  - Provider name for tracking (e.g. "fmp", "fred")
 * @param fetchFn   - Async function that returns fresh data if cache misses
 * @returns         - Cached or freshly fetched data
 */
export async function getCachedOrFetch<T>(
  cacheKey: string,
  ttlMs: number,
  provider: string,
  fetchFn: () => Promise<T>,
): Promise<T> {
  const client = getServiceClient()

  // Try to read from cache
  const { data: cached } = await client
    .from('api_cache')
    .select('data, expires_at')
    .eq('cache_key', cacheKey)
    .maybeSingle()

  if (cached && new Date(cached.expires_at) > new Date()) {
    return cached.data as T
  }

  // Cache miss or expired — fetch fresh data
  const freshData = await fetchFn()

  // Upsert into cache (fire-and-forget, don't block response)
  const expiresAt = new Date(Date.now() + ttlMs).toISOString()
  client
    .from('api_cache')
    .upsert(
      {
        cache_key: cacheKey,
        data: freshData,
        provider,
        expires_at: expiresAt,
      },
      { onConflict: 'cache_key' },
    )
    .then(() => {})  // suppress unhandled promise

  return freshData
}

/** Common TTL values */
export const TTL = {
  QUOTE: 60 * 1000,               // 1 minute
  SEARCH: 24 * 60 * 60 * 1000,    // 24 hours
  PROFILE: 24 * 60 * 60 * 1000,   // 24 hours
  HISTORICAL: 60 * 60 * 1000,     // 1 hour
  NEWS: 15 * 60 * 1000,           // 15 minutes
  FINANCIALS: 24 * 60 * 60 * 1000,// 24 hours
  SCREENER: 5 * 60 * 1000,        // 5 minutes
  ECONOMIC: 6 * 60 * 60 * 1000,   // 6 hours
}
