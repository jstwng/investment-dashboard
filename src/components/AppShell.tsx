import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Activity, BarChart2, Search as SearchIcon, LineChart, Globe } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import TickerSearch from './TickerSearch'

const navLinks = [
  { to: '/', label: 'Portfolio', icon: BarChart2 },
  { to: '/research', label: 'Research', icon: SearchIcon },
  { to: '/screener', label: 'Screener', icon: LineChart },
  { to: '/economy', label: 'Economy', icon: Globe },
]

export default function AppShell() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/login')
    } catch {
      // sign-out errors are non-critical
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-6">
            <NavLink to="/" className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-semibold text-zinc-100">Investment Dashboard</span>
            </NavLink>

            <nav className="hidden sm:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    }`
                  }
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right: Search + User */}
          <div className="flex items-center gap-3">
            <TickerSearch />
            <span className="hidden sm:inline font-mono text-xs text-zinc-500">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="rounded border border-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:border-zinc-600 hover:text-zinc-100 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
