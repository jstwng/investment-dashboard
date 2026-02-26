import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, BarChart2, Eye, TrendingUp, Wallet } from 'lucide-react'
import { useHoldings } from '../hooks/useHoldings'
import { useSnapTradeConnection } from '../hooks/useSnapTradeConnection'
import BentoGrid from '../components/ui/BentoGrid'
import Widget from '../components/ui/Widget'
import Metric from '../components/ui/Metric'
import DataTable from '../components/ui/DataTable'
import Tabs from '../components/ui/Tabs'
import OnboardingWizard from '../components/OnboardingWizard'
import type { HoldingRow, InvestmentHolding } from '../types'

// Watchlist remains static (not SnapTrade-sourced)
const watchlistByTab: Record<string, { ticker: string; price: string; change: string }[]> = {
  equities: [
    { ticker: 'META', price: '$527.10', change: '+2.34%' },
    { ticker: 'TSLA', price: '$178.20', change: '-1.87%' },
    { ticker: 'NFLX', price: '$632.40', change: '+0.95%' },
  ],
  etfs: [
    { ticker: 'SPY', price: '$529.80', change: '+0.42%' },
    { ticker: 'QQQ', price: '$458.30', change: '+0.61%' },
    { ticker: 'VTI', price: '$245.10', change: '+0.38%' },
  ],
  crypto: [
    { ticker: 'BTC', price: '$68,420', change: '+2.10%' },
    { ticker: 'ETH', price: '$3,540', change: '+1.45%' },
    { ticker: 'SOL', price: '$182.30', change: '+3.78%' },
  ],
}

const holdingsCols = [
  { key: 'ticker', header: 'Ticker' },
  { key: 'name', header: 'Name' },
  { key: 'shares', header: 'Shares' },
  { key: 'price', header: 'Price' },
  { key: 'value', header: 'Value' },
  {
    key: 'pnl',
    header: 'P&L',
    render: (row: Record<string, unknown>) => {
      const val = String(row.pnl ?? '')
      if (!val || val === '—') return <span className="text-zinc-500">—</span>
      const positive = !val.startsWith('-')
      return <span className={positive ? 'text-emerald-400' : 'text-rose-400'}>{val}</span>
    },
  },
  { key: 'account', header: 'Account' },
]

const watchlistCols = [
  { key: 'ticker', header: 'Ticker' },
  { key: 'price', header: 'Price' },
  {
    key: 'change',
    header: 'Change',
    render: (row: Record<string, unknown>) => {
      const val = String(row.change ?? '')
      const positive = val.startsWith('+')
      return <span className={positive ? 'text-emerald-400' : 'text-rose-400'}>{val}</span>
    },
  },
]

const watchlistTabs = [
  { id: 'equities', label: 'Equities' },
  { id: 'etfs', label: 'ETFs' },
  { id: 'crypto', label: 'Crypto' },
]

function fmt(value: number, style: 'currency' | 'percent' = 'currency'): string {
  if (style === 'percent') {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function toHoldingRows(holdings: InvestmentHolding[]): HoldingRow[] {
  return holdings.map((h) => ({
    id: h.id,
    ticker: h.ticker_symbol ?? '—',
    name: h.security_name ?? '—',
    shares: h.quantity != null ? h.quantity.toFixed(4).replace(/\.?0+$/, '') : '—',
    price: h.institution_price != null ? fmt(h.institution_price) : '—',
    value: h.institution_value != null ? fmt(h.institution_value) : '—',
    pnl: h.open_pnl != null ? `${h.open_pnl >= 0 ? '+' : ''}${fmt(h.open_pnl)}` : '—',
    account: h.external_account_id.slice(0, 8),
  }))
}

// Skeleton loader rows for the DataTable while loading
const SKELETON_ROWS: HoldingRow[] = Array.from({ length: 5 }, (_, i) => ({
  id: `skeleton-${i}`,
  ticker: '────',
  name: '──────────────',
  shares: '────',
  price: '────',
  value: '────',
  pnl: '────',
  account: '────',
}))

export default function DashboardPage() {
  const navigate = useNavigate()
  const { holdings, connectedAccounts, summary, isLoading, isSnapTradeRegistered, error, refresh } = useHoldings()
  const { wizardStep, setWizardStep, register, getConnectionLink, isConnecting, error: connectionError } = useSnapTradeConnection()
  const [activeWatchlistTab, setActiveWatchlistTab] = useState('equities')
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [successBanner, setSuccessBanner] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Return URL detection — runs once on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('snaptradeSuccess')) {
      history.replaceState(null, '', window.location.pathname)
      void refresh()
      setSuccessBanner(true)
      setTimeout(() => setSuccessBanner(false), 5000)
    }
  }, []) // empty deps — runs once on mount

  // Auto-open wizard for unregistered users
  useEffect(() => {
    if (!isLoading && !isSnapTradeRegistered) {
      setIsWizardOpen(true)
    }
  }, [isLoading, isSnapTradeRegistered])

  async function handleGetConnectionLink(broker?: string) {
    const uri = await getConnectionLink(broker)
    window.location.href = uri
  }

  function handleWizardClose() {
    setIsWizardOpen(false)
  }

  async function handleSync() {
    setIsSyncing(true)
    try {
      await refresh()
      setWizardStep('done')
    } finally {
      setIsSyncing(false)
    }
  }

  function handleRowClick(row: Record<string, unknown>) {
    const ticker = String(row.ticker ?? '')
    if (ticker && ticker !== '—' && ticker !== '────') {
      navigate(`/research/${ticker}`)
    }
  }

  function handleWatchlistRowClick(row: Record<string, unknown>) {
    const ticker = String(row.ticker ?? '')
    if (ticker) navigate(`/research/${ticker}`)
  }

  const holdingRows = isLoading ? SKELETON_ROWS : toHoldingRows(holdings)
  const hasHoldings = holdings.length > 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-3">
      {/* Page header with connect button */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">Portfolio</h1>
        <button
          onClick={() => setIsWizardOpen(true)}
          className="rounded border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:border-blue-600 hover:text-blue-400 transition-colors"
        >
          Connect Account
        </button>
      </div>
        {/* Success banner */}
        {successBanner && (
          <div className="rounded border border-emerald-800 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-400">
            Accounts connected! Syncing your holdings…
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="rounded border border-rose-800 bg-rose-950/40 px-4 py-3 text-sm text-rose-400">
            {error}
          </div>
        )}

        {/* Row 1 — Portfolio KPI metrics */}
        <BentoGrid cols={4}>
          <Widget title="Portfolio Value" icon={TrendingUp}>
            <Metric
              label="Total Value"
              value={isLoading ? '—' : fmt(summary.totalValue)}
              change={isLoading ? undefined : summary.totalReturnPercent}
              changeLabel="all-time"
            />
          </Widget>
          <Widget title="Total Return" icon={BarChart2}>
            <Metric
              label="All-time Return"
              value={isLoading ? '—' : `${summary.totalReturn >= 0 ? '+' : ''}${fmt(summary.totalReturn)}`}
              change={isLoading ? undefined : summary.totalReturnPercent}
            />
          </Widget>
          <Widget title="Cost Basis" icon={TrendingUp}>
            <Metric
              label="Total Cost Basis"
              value={isLoading ? '—' : fmt(summary.totalCostBasis)}
            />
          </Widget>
          <Widget title="Cash Balance" icon={Wallet}>
            <Metric
              label="Available Cash"
              value={isLoading ? '—' : fmt(summary.cashBalance)}
            />
          </Widget>
        </BentoGrid>

        {/* Row 2 — Holdings table + Watchlist */}
        <BentoGrid cols={4}>
          <div className="lg:col-span-3">
            <Widget title="Holdings" icon={BarChart2} className="h-full">
              {!isLoading && !hasHoldings ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Activity className="mb-3 h-8 w-8 text-zinc-600" />
                  <p className="text-sm font-medium text-zinc-400">No holdings yet</p>
                  <p className="mt-1 text-xs text-zinc-600">
                    Connect a brokerage account to see your real portfolio.
                  </p>
                  <button
                    onClick={() => { setIsWizardOpen(true); setWizardStep('connect_broker') }}
                    className="mt-4 rounded border border-blue-600 px-4 py-2 text-xs font-medium text-blue-400 hover:bg-blue-600/10 transition-colors"
                  >
                    Connect Account
                  </button>
                </div>
              ) : (
                <div className={isLoading ? 'animate-pulse' : ''}>
                  <DataTable columns={holdingsCols} data={holdingRows} onRowClick={handleRowClick} />
                </div>
              )}
            </Widget>
          </div>
          <div className="lg:col-span-1">
            <Widget title="Watchlist" icon={Eye} className="h-full">
              <div className="space-y-3">
                <Tabs
                  tabs={watchlistTabs}
                  activeTab={activeWatchlistTab}
                  onTabChange={setActiveWatchlistTab}
                />
                <DataTable
                  columns={watchlistCols}
                  data={watchlistByTab[activeWatchlistTab]}
                  onRowClick={handleWatchlistRowClick}
                />
              </div>
            </Widget>
          </div>
        </BentoGrid>

      <OnboardingWizard
        isOpen={isWizardOpen}
        wizardStep={wizardStep}
        connectedAccounts={connectedAccounts}
        onRegister={register}
        onGetConnectionLink={handleGetConnectionLink}
        onSync={handleSync}
        onClose={handleWizardClose}
        isConnecting={isConnecting}
        isSyncing={isSyncing}
        error={connectionError}
      />
    </div>
  )
}
