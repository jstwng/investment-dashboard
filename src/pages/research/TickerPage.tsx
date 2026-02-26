import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { useQuote } from '../../hooks/useQuote'
import { useHistoricalPrices } from '../../hooks/useHistoricalPrices'
import PriceChart from '../../components/PriceChart'
import type { Timeframe } from '../../types/market'

function fmt(value: number, style: 'currency' | 'compact' | 'percent' = 'currency'): string {
  if (style === 'percent') return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  if (style === 'compact') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function fmtVolume(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export default function TickerPage() {
  const { symbol } = useParams<{ symbol: string }>()
  const upperSymbol = symbol?.toUpperCase()
  const { quote, isLoading: quoteLoading } = useQuote(upperSymbol)
  const [timeframe, setTimeframe] = useState<Timeframe>('1Y')
  const { bars, isLoading: chartLoading } = useHistoricalPrices(upperSymbol, timeframe)

  const isPositive = (quote?.change ?? 0) >= 0

  return (
    <div className="space-y-4">
      {/* Back nav */}
      <Link to="/research" className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
        <ArrowLeft className="h-3 w-3" />
        Research
      </Link>

      {/* Quote header */}
      <div className="flex items-start justify-between">
        <div>
          {quoteLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-6 w-24 rounded bg-zinc-800" />
              <div className="h-4 w-48 rounded bg-zinc-800" />
            </div>
          ) : quote ? (
            <>
              <div className="flex items-baseline gap-3">
                <h1 className="text-xl font-bold text-zinc-100">{quote.symbol}</h1>
                <span className="text-sm text-zinc-400">{quote.exchange}</span>
              </div>
              <p className="text-sm text-zinc-400">{quote.name}</p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-2xl font-bold text-zinc-100">{fmt(quote.price)}</span>
                <span className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {fmt(quote.change)} ({fmt(quote.changesPercentage, 'percent')})
                </span>
              </div>
            </>
          ) : (
            <div className="text-sm text-zinc-400">
              No data found for <span className="font-semibold text-zinc-200">{upperSymbol}</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <PriceChart
          bars={bars}
          isLoading={chartLoading}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />
      </div>

      {/* Key stats grid */}
      {quote && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Open', value: fmt(quote.open) },
            { label: 'Previous Close', value: fmt(quote.previousClose) },
            { label: 'Day Range', value: `${fmt(quote.dayLow)} – ${fmt(quote.dayHigh)}` },
            { label: '52W Range', value: `${fmt(quote.yearLow)} – ${fmt(quote.yearHigh)}` },
            { label: 'Volume', value: fmtVolume(quote.volume) },
            { label: 'Avg Volume', value: fmtVolume(quote.avgVolume) },
            { label: 'Market Cap', value: fmt(quote.marketCap, 'compact') },
            { label: 'P/E Ratio', value: quote.pe ? quote.pe.toFixed(2) : '—' },
          ].map((stat) => (
            <div key={stat.label} className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2.5">
              <div className="text-[11px] text-zinc-500">{stat.label}</div>
              <div className="text-sm font-medium text-zinc-200">{stat.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
