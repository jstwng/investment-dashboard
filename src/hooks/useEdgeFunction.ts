import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export async function callEdgeFunction<T = unknown>(
  session: Session,
  functionName: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(functionName, {
    body,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  if (error) {
    // FunctionsHttpError carries the raw Response — extract the actual body
    if ('context' in error && error.context instanceof Response) {
      try {
        const body = await (error.context as Response).json() as { error?: string }
        if (body?.error) throw new Error(body.error)
      } catch (parseErr) {
        if (parseErr instanceof Error && parseErr.message !== 'Edge Function returned a non-2xx status code') {
          throw parseErr
        }
      }
    }
    throw error
  }
  if (data === null) throw new Error(`Edge function ${functionName} returned null`)

  return data
}
