import { useEffect, useRef } from 'react'

interface Props {
  /** Gọi với delta pixel ngang trong lúc kéo (dương = sang phải). */
  onDrag: (deltaX: number) => void
  /** true → render vạch tĩnh, không kéo (vd khi menu đã thu gọn). */
  disabled?: boolean
}

/**
 * Thanh chia dọc — kéo để chỉnh độ rộng pane bên trái. Tự xử lý pointer
 * events trên window để kéo mượt kể cả khi con trỏ ra ngoài thanh. Lib-free.
 */
export function ResizeHandle({ onDrag, disabled }: Props) {
  const dragging = useRef(false)
  const lastX = useRef(0)
  // Giữ callback mới nhất qua ref → subscribe window listener 1 lần, không
  // re-bind mỗi render (onDrag là closure đổi mỗi lần parent render).
  const onDragRef = useRef(onDrag)
  onDragRef.current = onDrag

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - lastX.current
      lastX.current = e.clientX
      if (dx !== 0) onDragRef.current(dx)
    }
    const end = () => {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
    }
  }, [])

  if (disabled) {
    return <div className="w-px shrink-0 bg-[#E5E7EB]" aria-hidden />
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      title="Kéo để chỉnh độ rộng"
      onPointerDown={(e) => {
        dragging.current = true
        lastX.current = e.clientX
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'
      }}
      className="group relative w-1.5 shrink-0 cursor-col-resize bg-[#E5E7EB] transition-colors hover:bg-[#2D6A8C]/40 active:bg-[#2D6A8C]/60"
    >
      {/* mở rộng vùng bắt chuột mà không ảnh hưởng layout */}
      <span className="absolute inset-y-0 -left-1.5 -right-1.5" />
    </div>
  )
}
