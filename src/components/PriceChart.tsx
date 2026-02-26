import { useEffect, useRef, useState } from 'react'
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type SeriesType,
  type CandlestickData,
  type LineData,
  type Time,
} from 'lightweight-charts'
import type { OHLCVBar, Timeframe } from '../types/market'

const TIMEFRAMES: Timeframe[] = ['1M', '3M', '6M', 'YTD', '1Y', '5Y', 'MAX']

interface PriceChartProps {
  bars: OHLCVBar[]
  isLoading: boolean
  timeframe: Timeframe
  onTimeframeChange: (tf: Timeframe) => void
  chartType?: 'candlestick' | 'line'
}

export default function PriceChart({
  bars,
  isLoading,
  timeframe,
  onTimeframeChange,
  chartType = 'candlestick',
}: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<SeriesType> | null>(null)
  const [activeType, setActiveType] = useState(chartType)

  // Create chart on mount
  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#a1a1aa', // zinc-400
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(63, 63, 70, 0.3)' },   // zinc-700 @ 30%
        horzLines: { color: 'rgba(63, 63, 70, 0.3)' },
      },
      crosshair: {
        vertLine: { color: '#3b82f6', labelBackgroundColor: '#3b82f6' },
        horzLine: { color: '#3b82f6', labelBackgroundColor: '#3b82f6' },
      },
      rightPriceScale: {
        borderColor: 'rgba(63, 63, 70, 0.5)',
      },
      timeScale: {
        borderColor: 'rgba(63, 63, 70, 0.5)',
        timeVisible: false,
      },
      handleScroll: { vertTouchDrag: false },
    })

    chartRef.current = chart

    // Responsive resize
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        chart.applyOptions({ width, height })
      }
    })
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [])

  // Update series data when bars or chart type changes
  useEffect(() => {
    const chart = chartRef.current
    if (!chart || bars.length === 0) return

    // Remove old series
    if (seriesRef.current) {
      chart.removeSeries(seriesRef.current)
      seriesRef.current = null
    }

    if (activeType === 'candlestick') {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#34d399',       // emerald-400
        downColor: '#fb7185',     // rose-400
        borderUpColor: '#34d399',
        borderDownColor: '#fb7185',
        wickUpColor: '#34d399',
        wickDownColor: '#fb7185',
      })

      const candleData: CandlestickData<Time>[] = bars.map((b) => ({
        time: b.date as Time,
        open: b.open,
        high: b.high,
        low: b.low,
        close: b.close,
      }))

      series.setData(candleData)
      seriesRef.current = series
    } else {
      const series = chart.addSeries(LineSeries, {
        color: '#3b82f6',         // blue-500
        lineWidth: 2,
        crosshairMarkerRadius: 4,
        crosshairMarkerBackgroundColor: '#3b82f6',
      })

      const lineData: LineData<Time>[] = bars.map((b) => ({
        time: b.date as Time,
        value: b.close,
      }))

      series.setData(lineData)
      seriesRef.current = series
    }

    chart.timeScale().fitContent()
  }, [bars, activeType])

  return (
    <div className="space-y-2">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(['candlestick', 'line'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`rounded px-2 py-0.5 text-[11px] font-medium capitalize transition-colors ${
                activeType === type
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-900/50">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        )}
        <div
          ref={containerRef}
          className="h-[400px] w-full rounded"
        />
      </div>
    </div>
  )
}
