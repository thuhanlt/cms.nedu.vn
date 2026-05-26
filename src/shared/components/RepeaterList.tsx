import type { ReactNode } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface RepeaterListProps<T> {
  items: T[]
  onChange: (items: T[]) => void
  createItem: () => T
  renderItem: (item: T, index: number, update: (patch: Partial<T>) => void) => ReactNode
  addLabel?: string
  minItems?: number
  itemLabel?: (index: number) => string
}

export function RepeaterList<T>({
  items,
  onChange,
  createItem,
  renderItem,
  addLabel = 'Thêm mục',
  minItems = 0,
  itemLabel,
}: RepeaterListProps<T>) {
  const remove = (index: number) => {
    if (items.length <= minItems) return
    onChange(items.filter((_, i) => i !== index))
  }
  const update = (index: number, patch: Partial<T>) => {
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }
  const add = () => onChange([...items, createItem()])

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="bg-[#F7F8FA] rounded-lg border border-[#E5E7EB] p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            {itemLabel && <span className="text-xs font-medium text-[#6B7280]">{itemLabel(i)}</span>}
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={items.length <= minItems}
              className="text-[#DC2626] hover:bg-[#FEE2E2] p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed ml-auto"
              aria-label="Xoá mục"
            >
              <Trash2 size={14} />
            </button>
          </div>
          {renderItem(item, i, (patch) => update(i, patch))}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-[#D1D5DB] text-sm text-[#6B7280] hover:border-[#2D6A8C] hover:text-[#2D6A8C] transition"
      >
        <Plus size={14} />
        {addLabel}
      </button>
    </div>
  )
}
