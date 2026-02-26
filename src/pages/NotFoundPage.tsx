import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-center">
      <span className="text-sm font-medium text-blue-500">404</span>
      <h1 className="mt-2 text-6xl font-bold text-zinc-100">Page not found</h1>
      <p className="mt-3 text-lg text-zinc-400">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400 transition-colors"
      >
        Go home
      </Link>
    </div>
  )
}
