// Mirrors snaptrade_users table (snaptrade_user_secret excluded)
export interface SnapTradeUser {
  id: string
  user_id: string
  snaptrade_user_id: string
  created_at: string
  updated_at: string
}

// Mirrors snaptrade_accounts / snaptrade_accounts_safe view
export interface SnapTradeAccount {
  id: string
  user_id: string
  snaptrade_account_id: string
  account_name: string | null
  account_number: string | null
  institution_name: string
  account_type: string | null
  status: 'active' | 'error' | 'revoked'
  last_synced_at: string | null
  cash_balance: number | null
  iso_currency_code: string
  created_at: string
  updated_at: string
}

export interface InvestmentHolding {
  id: string
  user_id: string
  snaptrade_account_id: string
  external_account_id: string
  snaptrade_symbol_id: string | null
  ticker_symbol: string | null
  security_name: string | null
  security_type: string | null
  quantity: number | null
  average_purchase_price: number | null
  institution_price: number | null
  institution_value: number | null
  open_pnl: number | null
  iso_currency_code: string
  created_at: string
  updated_at: string
}

export interface InvestmentTransaction {
  id: string
  user_id: string
  snaptrade_account_id: string
  external_account_id: string
  snaptrade_activity_id: string
  snaptrade_symbol_id: string | null
  ticker_symbol: string | null
  security_name: string | null
  transaction_type: string | null
  quantity: number | null
  price: number | null
  amount: number | null
  iso_currency_code: string
  date: string | null
  name: string | null
  created_at: string
}

export interface PortfolioSummary {
  totalValue: number
  totalCostBasis: number
  totalReturn: number
  totalReturnPercent: number
  cashBalance: number
}

// Row shape consumed by DataTable<T extends Record<string, unknown>>
export interface HoldingRow extends Record<string, unknown> {
  id: string
  ticker: string
  name: string
  shares: string
  price: string
  value: string
  pnl: string
  account: string
}

// Edge function response types
export interface RegisterUserResponse {
  snaptrade_user_id: string
}

export interface GetConnectionLinkResponse {
  redirect_uri: string
}

export interface SyncHoldingsResponse {
  synced_accounts: number
  holdings_count: number
  last_synced_at: string | null
}

export interface SyncTransactionsResponse {
  transactions_count: number
  last_synced_at: string
}
