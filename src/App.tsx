import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import ResearchLayout from './pages/research/ResearchLayout'
import ResearchHomePage from './pages/research/ResearchHomePage'
import TickerPage from './pages/research/TickerPage'
import ScreenerPage from './pages/screener/ScreenerPage'
import EconomyPage from './pages/economy/EconomyPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* All authenticated routes share the AppShell (nav bar + search) */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />

            {/* Research routes */}
            <Route path="research" element={<ResearchLayout />}>
              <Route index element={<ResearchHomePage />} />
              <Route path=":symbol" element={<TickerPage />} />
            </Route>

            {/* Screener */}
            <Route path="screener" element={<ScreenerPage />} />

            {/* Economy */}
            <Route path="economy" element={<EconomyPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
