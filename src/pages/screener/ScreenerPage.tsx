import { LineChart } from 'lucide-react'

export default function ScreenerPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="text-lg font-semibold text-zinc-100">Stock Screener</h1>
      <p className="mt-1 text-sm text-zinc-400">Filter and discover stocks by market cap, sector, P/E, and more.</p>

      <div className="mt-16 flex flex-col items-center justify-center text-center">
        <LineChart className="mb-4 h-10 w-10 text-zinc-600" />
        <p className="text-sm font-medium text-zinc-400">Coming soon</p>
        <p className="mt-1 text-xs text-zinc-600">The screener will be available in a future update.</p>
      </div>
    </div>
  )
}
