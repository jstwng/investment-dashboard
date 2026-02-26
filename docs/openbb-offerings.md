# OpenBB Platform — Data Capabilities Reference

> Hierarchical map of all OpenBB Platform endpoints (~350+ across 14 modules).
> Used as capability reference when deciding what to build in the investment dashboard.

---

## 1. Equity

### 1.1 Price
- `equity.price.quote` — Real-time / delayed quote
- `equity.price.historical` — OHLCV bars (1m → 1M)
- `equity.price.nbbo` — National Best Bid/Offer (L2)
- `equity.price.performance` — Period return (1D, 5D, 1M, 3M, 6M, YTD, 1Y, 3Y, 5Y, 10Y)

### 1.2 Fundamental
- `equity.fundamental.overview` — Company profile & description
- `equity.fundamental.income` — Income statement (annual / quarterly)
- `equity.fundamental.balance` — Balance sheet
- `equity.fundamental.cash` — Cash flow statement
- `equity.fundamental.ratios` — Financial ratios (P/E, P/B, ROE, etc.)
- `equity.fundamental.revenue_per_geography` — Revenue by region
- `equity.fundamental.revenue_per_segment` — Revenue by business segment
- `equity.fundamental.dividends` — Dividend history
- `equity.fundamental.splits` — Stock split history
- `equity.fundamental.earnings` — EPS actuals vs estimates
- `equity.fundamental.management` — Key executives
- `equity.fundamental.employee_count` — Historical headcount
- `equity.fundamental.filings` — SEC filings list (10-K, 10-Q, 8-K)
- `equity.fundamental.transcript` — Earnings call transcripts
- `equity.fundamental.metrics` — Key financial metrics summary

### 1.3 Ownership
- `equity.ownership.institutional` — Top institutional holders
- `equity.ownership.insider_trading` — Insider buy/sell transactions
- `equity.ownership.share_statistics` — Float, shares outstanding, short interest
- `equity.ownership.major_holders` — Breakdown (insiders, institutions, public)

### 1.4 Estimates
- `equity.estimates.consensus` — Analyst consensus (buy/hold/sell)
- `equity.estimates.price_target` — Analyst price targets
- `equity.estimates.analyst` — Individual analyst ratings
- `equity.estimates.forward_eps` — Forward EPS estimates
- `equity.estimates.forward_sales` — Forward revenue estimates
- `equity.estimates.historical` — Historical estimate revisions

### 1.5 Calendar
- `equity.calendar.earnings` — Upcoming earnings dates
- `equity.calendar.dividend` — Ex-dividend calendar
- `equity.calendar.splits` — Upcoming splits
- `equity.calendar.ipo` — IPO calendar

### 1.6 Discovery / Screener
- `equity.discovery.gainers` — Top gainers
- `equity.discovery.losers` — Top losers
- `equity.discovery.active` — Most active by volume
- `equity.screener` — Multi-factor stock screener (market cap, sector, P/E, etc.)

### 1.7 Search
- `equity.search` — Ticker / company name search

### 1.8 Peers
- `equity.compare.peers` — Similar companies

---

## 2. Fixed Income

- `fixedincome.rate.ameribor` — AMERIBOR rates
- `fixedincome.rate.fed` — Federal Funds rate (effective, target)
- `fixedincome.rate.sofr` — Secured Overnight Financing Rate
- `fixedincome.rate.estr` — Euro Short-Term Rate
- `fixedincome.rate.iorb` — Interest on Reserve Balances
- `fixedincome.rate.dpcredit` — Discount window primary credit
- `fixedincome.spreads.treasury` — Treasury yield spreads (2/10, 3m/10y)
- `fixedincome.government.treasury_rates` — Treasury yield curve (all tenors)
- `fixedincome.government.treasury_auctions` — Recent Treasury auctions
- `fixedincome.corporate.spot_rates` — Corporate bond spot rates
- `fixedincome.corporate.ice_bofa` — ICE BofA indices (IG, HY, EM)
- `fixedincome.corporate.hqm` — High Quality Market (HQM) yield curve
- `fixedincome.mortgage` — 15Y / 30Y mortgage rates

---

## 3. Crypto

- `crypto.price.historical` — OHLCV bars for crypto pairs
- `crypto.search` — Search crypto assets
- `crypto.price.quote` — Real-time crypto quote

---

## 4. Derivatives

### 4.1 Options
- `derivatives.options.chains` — Full options chain (calls + puts)
- `derivatives.options.unusual` — Unusual options activity
- `derivatives.options.snapshots` — Options market snapshot

### 4.2 Futures
- `derivatives.futures.curve` — Futures curve by commodity
- `derivatives.futures.historical` — Futures OHLCV

---

## 5. Forex (Currency)

- `currency.price.historical` — FX OHLCV (EUR/USD, etc.)
- `currency.search` — Search currency pairs
- `currency.snapshots` — Real-time FX rates
- `currency.reference_rates` — Central bank reference rates

---

## 6. Commodities

- `commodity.price.historical` — Commodity OHLCV (gold, oil, etc.)

---

## 7. Economy

### 7.1 Indicators
- `economy.gdp.nominal` — Nominal GDP
- `economy.gdp.real` — Real GDP
- `economy.gdp.forecast` — GDP forecast
- `economy.cpi` — Consumer Price Index
- `economy.pce` — Personal Consumption Expenditures
- `economy.ppi` — Producer Price Index
- `economy.unemployment` — Unemployment rate
- `economy.nonfarm_payrolls` — Non-farm payrolls (jobs report)
- `economy.composite_leading_indicator` — OECD CLI
- `economy.retail_sales` — Retail sales
- `economy.industrial_production` — Industrial production
- `economy.housing_starts` — Housing starts
- `economy.building_permits` — Building permits
- `economy.consumer_confidence` — Consumer confidence indices
- `economy.business_confidence` — Business confidence (PMI, ISM)
- `economy.money_measures` — M1, M2 money supply
- `economy.balance_of_payments` — Trade balance

### 7.2 Central Bank
- `economy.central_bank.calendar` — Rate decision calendar
- `economy.central_bank.projections` — Dot plot / rate projections

### 7.3 Calendar
- `economy.calendar` — Economic events calendar

---

## 8. Index

- `index.price.historical` — Index OHLCV (S&P 500, NASDAQ, etc.)
- `index.search` — Search indices
- `index.constituents` — Index constituents list
- `index.snapshots` — Real-time index values
- `index.sectors.performance` — Sector performance heatmap

---

## 9. ETFs

- `etf.search` — Search ETFs
- `etf.info` — ETF profile (expense ratio, AUM, category)
- `etf.holdings` — ETF top holdings
- `etf.sectors` — Sector weightings
- `etf.countries` — Country allocation
- `etf.price.historical` — ETF OHLCV
- `etf.price.performance` — ETF returns by period
- `etf.discovery.gainers` — Top ETF gainers
- `etf.discovery.losers` — Top ETF losers
- `etf.discovery.active` — Most active ETFs

---

## 10. News

- `news.world` — General financial news
- `news.company` — Company-specific news
- `news.crypto` — Crypto news

---

## 11. Technical Analysis

- `technical.sma` — Simple Moving Average
- `technical.ema` — Exponential Moving Average
- `technical.wma` — Weighted Moving Average
- `technical.rsi` — Relative Strength Index
- `technical.macd` — MACD (Moving Average Convergence Divergence)
- `technical.bbands` — Bollinger Bands
- `technical.stoch` — Stochastic Oscillator
- `technical.adx` — Average Directional Index
- `technical.obv` — On-Balance Volume
- `technical.atr` — Average True Range
- `technical.cci` — Commodity Channel Index
- `technical.aroon` — Aroon Indicator
- `technical.ichimoku` — Ichimoku Cloud
- `technical.vwap` — Volume-Weighted Average Price
- `technical.ad` — Accumulation/Distribution Line
- `technical.fib` — Fibonacci retracement
- `technical.kc` — Keltner Channels
- `technical.donchian` — Donchian Channels
- `technical.cg` — Center of Gravity

---

## 12. Regulators

- `regulators.sec.filings` — SEC EDGAR filings search
- `regulators.sec.ftd` — Fails-to-Deliver data
- `regulators.sec.institutions` — 13F institutional filings
- `regulators.cftc.cot` — Commitment of Traders report
- `regulators.sec.rss_litigation` — SEC litigation releases
- `regulators.sec.sro` — Self-Regulatory Organization filings

---

## 13. Quantitative Analysis

- `quantitative.normality` — Normality tests (Jarque-Bera, Shapiro-Wilk)
- `quantitative.summary` — Descriptive statistics (mean, std, skew, kurtosis)
- `quantitative.capm` — Capital Asset Pricing Model (alpha, beta)
- `quantitative.omega` — Omega ratio
- `quantitative.sortino` — Sortino ratio
- `quantitative.sharpe` — Sharpe ratio
- `quantitative.kurtosis` — Kurtosis
- `quantitative.unitroot` — Unit root tests (ADF, KPSS)
- `quantitative.rolling` — Rolling statistics (beta, std, mean, etc.)

---

## 14. Fama-French

- `fama_french.available` — List available Fama-French datasets
- `fama_french.data` — Download specific FF dataset (3-factor, 5-factor, momentum, etc.)

---

## Coverage Summary

| Module | Endpoint Count | Priority for Dashboard |
|---|---|---|
| Equity | ~60 | **High** — core research |
| Economy | ~30 | **High** — macro context |
| ETFs | ~12 | **Medium** — portfolio context |
| News | ~3 | **High** — market awareness |
| Technical Analysis | ~20 | **Medium** — chart overlays |
| Fixed Income | ~15 | **Low** — Phase 2+ |
| Crypto | ~3 | **Low** — Phase 2+ |
| Derivatives | ~5 | **Low** — Phase 2+ |
| Forex | ~5 | **Low** — Phase 2+ |
| Commodities | ~2 | **Low** — Phase 2+ |
| Index | ~6 | **Medium** — benchmarking |
| Regulators | ~6 | **Low** — advanced research |
| Quantitative Analysis | ~10 | **Low** — advanced analysis |
| Fama-French | ~2 | **Low** — academic research |

---

## Our Implementation Mapping

| OpenBB Capability | Our Implementation | Provider |
|---|---|---|
| `equity.search` | `market-data-search` | FMP `/search` |
| `equity.price.quote` | `market-data-quote` | FMP `/quote` |
| `equity.price.historical` | `market-data-historical` | FMP `/historical-price-full` |
| `equity.fundamental.overview` | `market-data-profile` | FMP `/profile` |
| `equity.fundamental.income` | `market-data-financials` | FMP `/income-statement` |
| `equity.fundamental.balance` | `market-data-financials` | FMP `/balance-sheet-statement` |
| `equity.fundamental.cash` | `market-data-financials` | FMP `/cash-flow-statement` |
| `news.company` | `market-data-news` | FMP `/stock_news` |
| `equity.estimates.*` | `market-data-estimates` | FMP `/analyst-estimates` |
| `equity.ownership.insider_trading` | `market-data-insiders` | FMP `/insider-trading` |
| `equity.screener` | `market-data-screener` | FMP `/stock-screener` |
| `etf.holdings` / `etf.sectors` | `market-data-etf` | FMP `/etf-holder` |
| `economy.*` | `economic-data-series` | FRED API |
| `technical.*` | Client-side `technicals.ts` | Computed from OHLCV |
