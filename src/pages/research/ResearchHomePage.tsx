import { Search } from 'lucide-react'

export default function ResearchHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-100">Research</h1>
        <p className="text-sm text-zinc-400">Search for a ticker to view quotes, charts, and company information.</p>
      </div>

      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Search className="mb-4 h-10 w-10 text-zinc-600" />
        <p className="text-sm font-medium text-zinc-400">Use the search bar above to look up a stock or ETF</p>
        <p className="mt-1 text-xs text-zinc-600">
          Try searching for "AAPL", "Tesla", or "SPY"
        </p>
      </div>
    </div>
  )
}
