import { useAuth } from '../contexts/AuthContext'

export default function DashboardPage() {
  const { user, signOut } = useAuth()

  async function handleSignOut() {
    try {
      await signOut()
    } catch {
      // sign-out errors are non-critical; session is cleared client-side
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold text-gray-900">Investment Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <p className="text-gray-600">Dashboard content coming soon.</p>
      </main>
    </div>
  )
}
