import { Outlet } from 'react-router-dom'

export default function ResearchLayout() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Outlet />
    </div>
  )
}
