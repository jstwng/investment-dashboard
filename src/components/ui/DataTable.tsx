import type { ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  className?: string
  onRowClick?: (row: T) => void
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  className = '',
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-400"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`transition-colors hover:bg-zinc-700/50 ${
                onRowClick ? 'cursor-pointer' : 'cursor-default'
              } ${rowIndex % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-800/50'}`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-3 py-2 text-zinc-100">
                  {col.render ? col.render(row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
