import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { callEdgeFunction } from './useEdgeFunction'
import type { SearchResult } from '../types/market'

interface UseTickerSearchResult {
  results: SearchResult[]
  isLoading: boolean
  search: (query: string) => void
  clear: () => void
}

export function useTickerSearch(debounceMs = 300): UseTickerSearchResult {
  const { session } = useAuth()
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef(0) // simple generation counter to discard stale results

  const search = useCallback(
    (query: string) => {
      if (timerRef.current) clearTimeout(timerRef.current)

      const trimmed = query.trim()
      if (!trimmed || trimmed.length < 1) {
        setResults([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      timerRef.current = setTimeout(async () => {
        if (!session) return
        const generation = ++abortRef.current
        try {
          const data = await callEdgeFunction<SearchResult[]>(session, 'market-data-search', {
            query: trimmed,
            limit: 8,
          })
          if (generation === abortRef.current) {
            setResults(data)
          }
        } catch {
          if (generation === abortRef.current) {
            setResults([])
          }
        } finally {
          if (generation === abortRef.current) {
            setIsLoading(false)
          }
        }
      }, debounceMs)
    },
    [session, debounceMs],
  )

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setResults([])
    setIsLoading(false)
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return { results, isLoading, search, clear }
}
