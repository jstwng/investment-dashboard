import type { ReactNode } from 'react'

interface BentoGridProps {
  cols?: 1 | 2 | 3 | 4 | 5 | 6
  children: ReactNode
  className?: string
}

const colsMap: Record<NonNullable<BentoGridProps['cols']>, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
}

export default function BentoGrid({ cols = 4, children, className = '' }: BentoGridProps) {
  return (
    <div className={`grid gap-3 grid-cols-1 sm:grid-cols-2 ${colsMap[cols]} ${className}`}>
      {children}
    </div>
  )
}
