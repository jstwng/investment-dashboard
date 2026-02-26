import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricProps {
  label: string
  value: string
  change?: number
  changeLabel?: string
}

export default function Metric({ label, value, change, changeLabel }: MetricProps) {
  const isPositive = change !== undefined && change >= 0

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wider text-zinc-400">{label}</span>
      <span className="font-mono text-2xl font-semibold text-zinc-100">{value}</span>
      {change !== undefined && (
        <div
          className={`inline-flex w-fit items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${
            isPositive
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/20 text-rose-400'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {isPositive ? '+' : ''}
          {change.toFixed(2)}%{changeLabel ? ` ${changeLabel}` : ''}
        </div>
      )}
    </div>
  )
}
