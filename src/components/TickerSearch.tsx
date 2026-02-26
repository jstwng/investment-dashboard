import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Loader2 } from 'lucide-react'
import { useTickerSearch } from '../hooks/useTickerSearch'

export default function TickerSearch() {
  const navigate = useNavigate()
  const { results, isLoading, search, clear } = useTickerSearch()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleInputChange(value: string) {
    setQuery(value)
    if (value.trim()) {
      search(value)
      setIsOpen(true)
    } else {
      clear()
      setIsOpen(false)
    }
  }

  function handleSelect(symbol: string) {
    setQuery('')
    clear()
    setIsOpen(false)
    navigate(`/research/${symbol}`)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
    if (e.key === 'Enter' && results.length > 0) {
      handleSelect(results[0].symbol)
    }
  }

  return (
    <div ref={containerRef} className="relative w-64">
      <div className="flex items-center rounded border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 focus-within:border-blue-600 transition-colors">
        {isLoading ? (
          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin text-zinc-500" />
        ) : (
          <Search className="mr-2 h-3.5 w-3.5 text-zinc-500" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query.trim() && results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search ticker or company…"
          className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 outline-none"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded border border-zinc-700 bg-zinc-900 shadow-xl">
          {results.map((r) => (
            <button
              key={r.symbol}
              onClick={() => handleSelect(r.symbol)}
              className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-zinc-800 transition-colors first:rounded-t last:rounded-b"
            >
              <div>
                <span className="text-xs font-semibold text-zinc-100">{r.symbol}</span>
                <span className="ml-2 text-xs text-zinc-400 truncate">{r.name}</span>
              </div>
              <span className="text-[10px] text-zinc-600">{r.exchangeShortName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
