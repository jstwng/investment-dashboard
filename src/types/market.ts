/** Ticker search result from FMP /search */
export interface SearchResult {
  symbol: string
  name: string
  currency: string
  stockExchange: string
  exchangeShortName: string
}

/** Real-time quote from FMP /quote */
export interface Quote {
  symbol: string
  name: string
  price: number
  changesPercentage: number
  change: number
  dayLow: number
  dayHigh: number
  yearHigh: number
  yearLow: number
  marketCap: number
  priceAvg50: number
  priceAvg200: number
  exchange: string
  volume: number
  avgVolume: number
  open: number
  previousClose: number
  eps: number
  pe: number
  earningsAnnouncement: string | null
  sharesOutstanding: number
  timestamp: number
}

/** Single OHLCV bar from FMP /historical-price-full */
export interface OHLCVBar {
  date: string
  open: number
  high: number
  low: number
  close: number
  adjClose: number
  volume: number
  change: number
  changePercent: number
  vwap: number
}

/** Historical price response from FMP */
export interface HistoricalPriceResponse {
  symbol: string
  historical: OHLCVBar[]
}

/** Company profile from FMP /profile */
export interface CompanyProfile {
  symbol: string
  companyName: string
  currency: string
  exchange: string
  exchangeShortName: string
  price: number
  beta: number
  volAvg: number
  mktCap: number
  lastDiv: number
  range: string
  changes: number
  cik: string
  isin: string
  cusip: string
  industry: string
  website: string
  description: string
  ceo: string
  sector: string
  country: string
  fullTimeEmployees: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  dcfDiff: number
  dcf: number
  image: string
  ipoDate: string
  isEtf: boolean
  isActivelyTrading: boolean
  isFund: boolean
}

/** News article from FMP /stock_news */
export interface NewsArticle {
  symbol: string
  publishedDate: string
  title: string
  image: string
  site: string
  text: string
  url: string
}

/** Timeframe options for chart */
export type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y' | 'MAX'

/** Mapping of timeframe to date range in days (approximate) */
export const TIMEFRAME_DAYS: Record<Timeframe, number | null> = {
  '1D': 1,
  '5D': 5,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  'YTD': null, // computed dynamically
  '1Y': 365,
  '5Y': 1825,
  'MAX': null,
}
