import { Globe } from 'lucide-react'

export default function EconomyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="text-lg font-semibold text-zinc-100">Economy</h1>
      <p className="mt-1 text-sm text-zinc-400">Track key economic indicators: GDP, CPI, unemployment, and interest rates.</p>

      <div className="mt-16 flex flex-col items-center justify-center text-center">
        <Globe className="mb-4 h-10 w-10 text-zinc-600" />
        <p className="text-sm font-medium text-zinc-400">Coming soon</p>
        <p className="mt-1 text-xs text-zinc-600">Economic data charts will be available in a future update.</p>
      </div>
    </div>
  )
}
