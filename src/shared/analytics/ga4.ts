declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

let measurementId: string | null = null

export function initGa4(id: string) {
  if (typeof window === 'undefined' || !id) return
  measurementId = id

  if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${id}"]`)) {
    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
    document.head.appendChild(s)
  }

  window.dataLayer = window.dataLayer ?? []
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', id, { send_page_view: false })
}

export function ga4PageView(path: string, title?: string) {
  if (!measurementId || !window.gtag) return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title ?? document.title,
    send_to: measurementId,
  })
}

export function ga4Event(name: string, params?: Record<string, unknown>) {
  if (!measurementId || !window.gtag) return
  window.gtag('event', name, params ?? {})
}
