import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { callEdgeFunction } from './useEdgeFunction'
import type { HistoricalPriceResponse, OHLCVBar, Timeframe } from '../types/market'

interface UseHistoricalPricesResult {
  bars: OHLCVBar[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

function getDateRange(timeframe: Timeframe): { from?: string; to?: string } {
  const to = new Date()
  const toStr = to.toISOString().slice(0, 10)

  if (timeframe === 'MAX') return {}
  if (timeframe === 'YTD') {
    return { from: `${to.getFullYear()}-01-01`, to: toStr }
  }

  const days: Record<Exclude<Timeframe, 'MAX' | 'YTD'>, number> = {
    '1D': 1,
    '5D': 5,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
    '5Y': 1825,
  }

  const from = new Date(to)
  from.setDate(from.getDate() - days[timeframe as keyof typeof days])
  return { from: from.toISOString().slice(0, 10), to: toStr }
}

export function useHistoricalPrices(
  symbol: string | undefined,
  timeframe: Timeframe = '1Y',
): UseHistoricalPricesResult {
  const { session } = useAuth()
  const [bars, setBars] = useState<OHLCVBar[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPrices = useCallback(async () => {
    if (!session || !symbol) return
    setIsLoading(true)
    setError(null)
    try {
      const { from, to } = getDateRange(timeframe)
      const data = await callEdgeFunction<HistoricalPriceResponse>(
        session,
        'market-data-historical',
        { symbol, ...(from && { from }), ...(to && { to }) },
      )
      // FMP returns newest first — reverse for chart (oldest first)
      setBars((data.historical ?? []).reverse())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices')
    } finally {
      setIsLoading(false)
    }
  }, [session, symbol, timeframe])

  useEffect(() => {
    fetchPrices()
  }, [fetchPrices])

  return { bars, isLoading, error, refresh: fetchPrices }
}
