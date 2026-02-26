/**
 * Financial Modeling Prep (FMP) API client for Supabase Edge Functions.
 * Wraps fetch with API key injection and error handling.
 */

const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3'

export class FmpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'FmpError'
  }
}

/**
 * Make an authenticated request to the FMP API.
 *
 * @param endpoint - Path after `/api/v3`, e.g. `/quote/AAPL`
 * @param params   - Optional query parameters (apikey is added automatically)
 * @returns        - Parsed JSON response typed as T
 */
export async function callFmp<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  const apiKey = Deno.env.get('FMP_API_KEY')
  if (!apiKey) {
    throw new FmpError(500, 'FMP_API_KEY is not set in environment')
  }

  const url = new URL(`${FMP_BASE_URL}${endpoint}`)
  url.searchParams.set('apikey', apiKey)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const response = await fetch(url.toString())

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText)
    throw new FmpError(response.status, `FMP API error ${response.status}: ${text}`)
  }

  return response.json() as Promise<T>
}
