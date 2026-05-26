import { env } from '@shared/config/env'
import { initGa4, ga4Event, ga4PageView } from './ga4'
import { initClarity, claritySet, clarityEvent } from './clarity'
import type { AnalyticsEvent } from './events'

const ENABLED_HOSTNAMES = ['cms.nedu.vn']

function isEnabledHost(): boolean {
  if (typeof window === 'undefined') return false
  return ENABLED_HOSTNAMES.includes(window.location.hostname)
}

let enabled = false

export const analytics = {
  init() {
    if (!isEnabledHost()) return
    enabled = true
    if (env.VITE_GA4_ID) initGa4(env.VITE_GA4_ID)
    if (env.VITE_CLARITY_ID) initClarity(env.VITE_CLARITY_ID)
  },
  pageView(path: string, title?: string) {
    if (!enabled) return
    ga4PageView(path, title)
  },
  track(event: AnalyticsEvent) {
    if (!enabled) return
    ga4Event(event.name, event.params)
    clarityEvent(event.name)
  },
  identify(userId: string, role?: string) {
    if (!enabled) return
    claritySet('user_id', userId)
    if (role) claritySet('role', role)
  },
}
