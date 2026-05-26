import Clarity from '@microsoft/clarity'

let started = false

export function initClarity(projectId: string) {
  if (typeof window === 'undefined' || !projectId || started) return
  try {
    Clarity.init(projectId)
    started = true
  } catch {
    /* swallow — analytics must not break app */
  }
}

export function claritySet(key: string, value: string) {
  if (!started) return
  try {
    Clarity.setTag(key, value)
  } catch {
    /* swallow */
  }
}

export function clarityEvent(name: string) {
  if (!started) return
  try {
    Clarity.event(name)
  } catch {
    /* swallow */
  }
}
