import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { callEdgeFunction } from './useEdgeFunction'
import { useAuth } from '../contexts/AuthContext'
import type { InvestmentHolding, SnapTradeAccount, PortfolioSummary, SyncHoldingsResponse } from '../types'

interface UseHoldingsResult {
  holdings: InvestmentHolding[]
  connectedAccounts: SnapTradeAccount[]
  summary: PortfolioSummary
  isLoading: boolean
  isSnapTradeRegistered: boolean
  error: string | null
  refresh: () => Promise<void>
}

function derivePortfolioSummary(holdings: InvestmentHolding[], accounts: SnapTradeAccount[]): PortfolioSummary {
  let totalValue = 0
  let totalCostBasis = 0
  let cashBalance = 0

  for (const h of holdings) {
    totalValue += h.institution_value ?? 0
    // cost basis = average_purchase_price per unit * quantity
    totalCostBasis += (h.average_purchase_price ?? 0) * (h.quantity ?? 0)
  }

  for (const a of accounts) {
    cashBalance += a.cash_balance ?? 0
  }

  const totalReturn = totalValue - totalCostBasis
  const totalReturnPercent = totalCostBasis > 0 ? (totalReturn / totalCostBasis) * 100 : 0

  return { totalValue, totalCostBasis, totalReturn, totalReturnPercent, cashBalance }
}

export function useHoldings(): UseHoldingsResult {
  const { session } = useAuth()
  const [holdings, setHoldings] = useState<InvestmentHolding[]>([])
  const [connectedAccounts, setConnectedAccounts] = useState<SnapTradeAccount[]>([])
  const [isSnapTradeRegistered, setIsSnapTradeRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFromDb = useCallback(async () => {
    const [holdingsResult, accountsResult, registrationResult] = await Promise.all([
      supabase.from('investment_holdings').select('*').order('institution_value', { ascending: false }),
      supabase.from('snaptrade_accounts_safe').select('*').order('created_at', { ascending: true }),
      supabase.from('snaptrade_users').select('id').limit(1),
    ])

    if (holdingsResult.error) throw new Error(holdingsResult.error.message)
    if (accountsResult.error) throw new Error(accountsResult.error.message)
    // registrationResult error is non-fatal (table may not exist yet in dev)

    setHoldings((holdingsResult.data as InvestmentHolding[]) ?? [])
    setConnectedAccounts((accountsResult.data as SnapTradeAccount[]) ?? [])
    setIsSnapTradeRegistered(!registrationResult.error && (registrationResult.data?.length ?? 0) > 0)
  }, [])

  useEffect(() => {
    if (!session) return
    setIsLoading(true)
    fetchFromDb()
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load holdings'))
      .finally(() => setIsLoading(false))
  }, [session, fetchFromDb])

  const refresh = useCallback(async () => {
    if (!session) return
    setIsLoading(true)
    setError(null)
    try {
      await callEdgeFunction<SyncHoldingsResponse>(session, 'snaptrade-sync-holdings')
      await fetchFromDb()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setIsLoading(false)
    }
  }, [session, fetchFromDb])

  const summary = derivePortfolioSummary(holdings, connectedAccounts)

  return { holdings, connectedAccounts, summary, isLoading, isSnapTradeRegistered, error, refresh }
}
