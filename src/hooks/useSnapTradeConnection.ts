import { useCallback, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { callEdgeFunction } from './useEdgeFunction'
import type { RegisterUserResponse, GetConnectionLinkResponse } from '../types'

export type WizardStep = 'welcome' | 'registering' | 'connect_broker' | 'done'

interface UseSnapTradeConnectionResult {
  wizardStep: WizardStep
  setWizardStep: (step: WizardStep) => void
  register: () => Promise<void>
  getConnectionLink: (broker?: string) => Promise<string>
  isConnecting: boolean
  error: string | null
}

export function useSnapTradeConnection(): UseSnapTradeConnectionResult {
  const { session } = useAuth()
  const [wizardStep, setWizardStep] = useState<WizardStep>('welcome')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const register = useCallback(async () => {
    if (!session) {
      setError('No active session. Please sign in.')
      return
    }

    setIsConnecting(true)
    setError(null)
    setWizardStep('registering')

    try {
      await callEdgeFunction<RegisterUserResponse>(session, 'snaptrade-register-user')
      setWizardStep('connect_broker')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register SnapTrade user')
      setWizardStep('welcome')
    } finally {
      setIsConnecting(false)
    }
  }, [session])

  const getConnectionLink = useCallback(
    async (broker?: string): Promise<string> => {
      if (!session) {
        const msg = 'No active session. Please sign in.'
        setError(msg)
        throw new Error(msg)
      }

      setIsConnecting(true)
      setError(null)

      try {
        const body = broker ? { broker } : {}
        const { redirect_uri } = await callEdgeFunction<GetConnectionLinkResponse>(
          session,
          'snaptrade-get-connection-link',
          body,
        )
        return redirect_uri
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to get connection link'
        setError(msg)
        throw err
      } finally {
        setIsConnecting(false)
      }
    },
    [session],
  )

  return {
    wizardStep,
    setWizardStep,
    register,
    getConnectionLink,
    isConnecting,
    error,
  }
}
