import { env } from '@shared/config/env'

const RELOAD_FLAG = 'nedu_cms_mock_unreg_reload'

export async function enableMocking(): Promise<void> {
  if (typeof window === 'undefined') return

  if (!env.VITE_ENABLE_MOCKING) {
    // Mock OFF — đảm bảo SW cũ không còn intercept request.
    if ('serviceWorker' in navigator) {
      try {
        const regs = await navigator.serviceWorker.getRegistrations()
        let unregistered = false
        for (const reg of regs) {
          await reg.unregister()
          unregistered = true
        }
        if ('caches' in window) {
          const keys = await caches.keys()
          await Promise.all(keys.map((k) => caches.delete(k)))
        }
        if (unregistered && !sessionStorage.getItem(RELOAD_FLAG)) {
          sessionStorage.setItem(RELOAD_FLAG, '1')
          window.location.reload()
        }
      } catch {
        /* ignore — không block app boot */
      }
    }
    return
  }

  sessionStorage.removeItem(RELOAD_FLAG)
  try {
    const { worker } = await import('./browser')
    await worker.start({
      serviceWorker: { url: '/mockServiceWorker.js' },
      onUnhandledRequest(req, print) {
        const url = new URL(req.url)
        if (url.pathname.startsWith('/api/')) print.warning()
      },
    })
  } catch (err) {
    // MSW fail không được block render — log + tiếp tục.
    // Request /api/* sẽ rớt vào nhánh isError → UI hiện "Không tải được, Thử lại".
    // eslint-disable-next-line no-console
    console.error('[MSW] Không khởi động được mock worker — chạy ở chế độ live API:', err)
  }
}
