import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { MoreHorizontal } from 'lucide-react'

interface WidgetProps {
  title: string
  icon: LucideIcon
  children: ReactNode
  className?: string
}

export default function Widget({ title, icon: Icon, children, className = '' }: WidgetProps) {
  return (
    <div className={`flex flex-col rounded-md border border-zinc-800 bg-zinc-900 ${className}`}>
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-100">{title}</span>
        </div>
        <button
          type="button"
          className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          aria-label="Widget options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 p-4">{children}</div>
    </div>
  )
}
