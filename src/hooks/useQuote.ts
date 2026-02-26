import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { callEdgeFunction } from './useEdgeFunction'
import type { Quote } from '../types/market'

interface UseQuoteResult {
  quote: Quote | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useQuote(symbol: string | undefined): UseQuoteResult {
  const { session } = useAuth()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuote = useCallback(async () => {
    if (!session || !symbol) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await callEdgeFunction<Quote[]>(session, 'market-data-quote', { symbol })
      setQuote(data?.[0] ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quote')
    } finally {
      setIsLoading(false)
    }
  }, [session, symbol])

  useEffect(() => {
    fetchQuote()
  }, [fetchQuote])

  return { quote, isLoading, error, refresh: fetchQuote }
}
