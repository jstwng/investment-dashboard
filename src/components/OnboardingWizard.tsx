import { Activity, CheckCircle2, Loader2, X, Building2, AlertCircle } from 'lucide-react'
import type { WizardStep } from '../hooks/useSnapTradeConnection'
import type { SnapTradeAccount } from '../types/snaptrade'

interface OnboardingWizardProps {
  isOpen: boolean
  wizardStep: WizardStep
  connectedAccounts: SnapTradeAccount[]
  onRegister: () => void
  onGetConnectionLink: (broker?: string) => Promise<void>
  onSync: () => Promise<void>
  onClose: () => void
  isConnecting: boolean
  isSyncing: boolean
  error: string | null
}

function StepDots({ wizardStep }: { wizardStep: WizardStep }) {
  const stepIndex =
    wizardStep === 'welcome'
      ? 0
      : wizardStep === 'registering'
        ? 1
        : 2 // 'connect_broker' | 'done'

  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full ${i <= stepIndex ? 'bg-blue-500' : 'bg-zinc-700'}`}
        />
      ))}
    </div>
  )
}

function ConnectedAccountRow({ account }: { account: SnapTradeAccount }) {
  const isError = account.status === 'error' || account.status === 'revoked'

  return (
    <div className="flex items-center justify-between rounded border border-zinc-700 bg-zinc-800/50 px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <Building2 className="h-4 w-4 shrink-0 text-zinc-400" />
        <div>
          <p className="text-sm font-medium text-zinc-100">{account.institution_name}</p>
          {account.account_name && (
            <p className="text-xs text-zinc-500">{account.account_name}</p>
          )}
          {account.last_synced_at && !isError && (
            <p className="text-xs text-zinc-500">
              Synced {new Date(account.last_synced_at).toLocaleString()}
            </p>
          )}
          {isError && (
            <p className="text-xs text-rose-400">Connection error — reconnect required</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isError ? (
          <AlertCircle className="h-4 w-4 text-rose-400" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        )}
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${
            isError
              ? 'bg-rose-400/10 text-rose-400'
              : 'bg-emerald-400/10 text-emerald-400'
          }`}
        >
          {account.status}
        </span>
      </div>
    </div>
  )
}

function WelcomeStep({
  onRegister,
  isConnecting,
  error,
}: {
  onRegister: () => void
  isConnecting: boolean
  error: string | null
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 px-5 text-center">
      <Activity className="h-10 w-10 text-blue-500" />
      <div className="space-y-1.5">
        <h2 className="text-base font-semibold text-zinc-100">
          Connect your brokerage accounts
        </h2>
        <p className="text-sm text-zinc-400">
          SnapTrade securely links your Robinhood, Fidelity, and other accounts. Your credentials
          are never stored by this app.
        </p>
      </div>
      <button
        onClick={onRegister}
        disabled={isConnecting}
        className="w-full rounded border border-blue-600 bg-blue-600/10 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {isConnecting ? 'Starting…' : 'Get Started'}
      </button>
      {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
    </div>
  )
}

function RegisteringStep() {
  return (
    <div className="flex flex-col items-center gap-3 py-10 px-5">
      <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      <p className="text-sm text-zinc-400 text-center">Setting up your account…</p>
    </div>
  )
}

function ConnectBrokerStep({
  connectedAccounts,
  onGetConnectionLink,
  onSync,
  isConnecting,
  isSyncing,
  error,
}: {
  connectedAccounts: SnapTradeAccount[]
  onGetConnectionLink: (broker?: string) => Promise<void>
  onSync: () => Promise<void>
  isConnecting: boolean
  isSyncing: boolean
  error: string | null
}) {
  return (
    <div className="space-y-4 p-5">
      <h3 className="text-sm font-semibold text-zinc-100">Connect a Brokerage</h3>

      {connectedAccounts.length > 0 && (
        <div className="space-y-2">
          {connectedAccounts.map((account) => (
            <ConnectedAccountRow key={account.id} account={account} />
          ))}
        </div>
      )}

      <button
        onClick={() => onGetConnectionLink()}
        disabled={isConnecting || isSyncing}
        className="w-full rounded border border-blue-600 bg-blue-600/10 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {isConnecting ? 'Connecting…' : 'Add Account'}
      </button>

      <button
        onClick={onSync}
        disabled={isConnecting || isSyncing}
        className="w-full rounded border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {isSyncing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {isSyncing ? 'Syncing…' : 'Already connected? Sync now'}
      </button>

      {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}

      <p className="text-xs text-zinc-500">
        You'll be redirected to SnapTrade's secure connection portal.
      </p>
    </div>
  )
}

function DoneStep({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 px-5 text-center">
      <CheckCircle2 className="h-10 w-10 text-emerald-400" />
      <div className="space-y-1.5">
        <h2 className="text-base font-semibold text-zinc-100">Accounts connected!</h2>
        <p className="text-sm text-zinc-400">
          Your holdings will appear in the dashboard momentarily.
        </p>
      </div>
      <button
        onClick={onClose}
        className="w-full rounded border border-blue-600 bg-blue-600/10 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 transition-colors"
      >
        View Dashboard
      </button>
    </div>
  )
}

export default function OnboardingWizard({
  isOpen,
  wizardStep,
  connectedAccounts,
  onRegister,
  onGetConnectionLink,
  onSync,
  onClose,
  isConnecting,
  isSyncing,
  error,
}: OnboardingWizardProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-zinc-100">Set Up Your Portfolio</h2>
          <div className="flex items-center gap-3">
            <StepDots wizardStep={wizardStep} />
            <button
              onClick={onClose}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        {wizardStep === 'welcome' && (
          <WelcomeStep onRegister={onRegister} isConnecting={isConnecting} error={error} />
        )}
        {wizardStep === 'registering' && <RegisteringStep />}
        {wizardStep === 'connect_broker' && (
          <ConnectBrokerStep
            connectedAccounts={connectedAccounts}
            onGetConnectionLink={onGetConnectionLink}
            onSync={onSync}
            isConnecting={isConnecting}
            isSyncing={isSyncing}
            error={error}
          />
        )}
        {wizardStep === 'done' && <DoneStep onClose={onClose} />}

        {/* Footer */}
        <div className="rounded-b-lg border-t border-zinc-800 px-5 py-3">
          <p className="text-xs text-zinc-600">Powered by SnapTrade</p>
        </div>
      </div>
    </div>
  )
}
