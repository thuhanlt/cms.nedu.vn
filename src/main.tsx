import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import './index.css'
import { enableMocking } from './mocks/init'
import { analytics } from './shared/analytics'
import { AppRouter } from './routes'
import { ErrorBoundary } from './shared/components/ErrorBoundary'

const rootEl = document.getElementById('root')!

function renderApp(root: Root) {
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    </StrictMode>,
  )
}

function renderBootstrapError(err: unknown) {
  const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
  rootEl.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#F7F8FA;padding:24px;font-family:Inter,system-ui,sans-serif">
      <div style="max-width:520px;width:100%;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:24px">
        <h1 style="font-size:20px;font-weight:600;color:#DC2626;margin:0 0 8px">Không khởi động được Nedu CMS</h1>
        <p style="font-size:14px;color:#374151;margin:0 0 12px">Trang bị lỗi ngay khi khởi động (trước khi React render). Thường do thiếu biến môi trường trên Vercel/Cloudflare.</p>
        <pre style="font-size:12px;background:#F7F8FA;border:1px solid #E5E7EB;border-radius:6px;padding:12px;overflow:auto;max-height:200px;white-space:pre-wrap;word-break:break-all">${message}</pre>
        <p style="font-size:12px;color:#6B7280;margin:12px 0 0">Mở DevTools (F12) → Console để xem chi tiết.</p>
      </div>
    </div>
  `
  // eslint-disable-next-line no-console
  console.error('[bootstrap]', err)
}

async function bootstrap() {
  const root = createRoot(rootEl)
  try {
    await enableMocking()
    analytics.init()
    renderApp(root)
  } catch (err) {
    renderBootstrapError(err)
  }
}

void bootstrap()
