import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const btn = (label, p, disabled = false, active = false) => (
    <button
      key={`${label}-${p}`}
      onClick={() => !disabled && onChange(p)}
      disabled={disabled}
      className={`w-9 h-9 flex items-center justify-center rounded text-sm transition
        ${active   ? 'bg-primary text-white font-semibold'           : ''}
        ${!active && !disabled ? 'text-gray-carbon hover:bg-gray-soft' : ''}
        ${disabled ? 'text-gray-300 cursor-default'                  : 'cursor-pointer'}
      `}
    >
      {label}
    </button>
  )

  // Generar páginas visibles: siempre 1, última, y ±1 alrededor de la actual
  const pages = new Set([1, totalPages, page, page - 1, page + 1].filter((p) => p >= 1 && p <= totalPages))
  const sorted = [...pages].sort((a, b) => a - b)

  const items = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) {
      items.push(<span key={`dots-${p}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>)
    }
    items.push(btn(p, p, false, p === page))
  })

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      {btn(<ChevronLeft className="w-4 h-4" />, page - 1, page === 1)}
      {items}
      {btn(<ChevronRight className="w-4 h-4" />, page + 1, page === totalPages)}
    </div>
  )
}
