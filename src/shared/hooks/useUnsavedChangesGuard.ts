import { useEffect } from 'react'

const DEFAULT_MESSAGE = 'Thay đổi chưa lưu sẽ bị mất. Vẫn rời trang?'

/**
 * Guard "chưa lưu mà rời trang" cho editor/builder:
 * - `beforeunload` → browser confirm khi reload / đóng tab / điều hướng ra ngoài.
 * - Click link nội bộ (React Router `<Link>` render `<a href="/...">`) → chặn ở
 *   capture phase + `window.confirm` — pattern đơn giản, đủ cho CMS nội bộ.
 *
 * KHÔNG chặn: navigate() programmatic (sau khi lưu xong page tự điều hướng),
 * link `target="_blank"` (mở tab mới, không mất state), nút Back của browser
 * (cần data router mới block được — chấp nhận, beforeunload đã cover reload/close).
 */
export function useUnsavedChangesGuard(dirty: boolean, message = DEFAULT_MESSAGE) {
  useEffect(() => {
    if (!dirty) return

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      // Chrome legacy yêu cầu returnValue để hiện dialog
      e.returnValue = ''
    }

    const onClickCapture = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const target = e.target as Element | null
      const anchor = target?.closest?.('a[href]')
      if (!anchor) return
      if (anchor.getAttribute('target') === '_blank') return
      const href = anchor.getAttribute('href') ?? ''
      if (!href.startsWith('/')) return // external / hash / mailto — để beforeunload lo
      if (window.confirm(message)) return
      e.preventDefault()
      e.stopPropagation()
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    document.addEventListener('click', onClickCapture, true)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('click', onClickCapture, true)
    }
  }, [dirty, message])
}
