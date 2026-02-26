import type { Session, User } from '@supabase/supabase-js'

export interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export type {
  SnapTradeUser,
  SnapTradeAccount,
  InvestmentHolding,
  InvestmentTransaction,
  PortfolioSummary,
  HoldingRow,
  RegisterUserResponse,
  GetConnectionLinkResponse,
  SyncHoldingsResponse,
  SyncTransactionsResponse,
} from './snaptrade'
