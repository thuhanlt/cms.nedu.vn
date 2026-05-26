import { create } from 'zustand'

export type ToastKind = 'success' | 'info' | 'warn' | 'error'

export interface ToastItem {
  id: string
  kind: ToastKind
  message: string
}

interface ToastState {
  items: ToastItem[]
  push: (kind: ToastKind, message: string) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set, get) => ({
  items: [],
  push: (kind, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    set((s) => ({ items: [...s.items, { id, kind, message }] }))
    setTimeout(() => get().dismiss(id), 3500)
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}))

export const toast = {
  success: (msg: string) => useToastStore.getState().push('success', msg),
  info: (msg: string) => useToastStore.getState().push('info', msg),
  warn: (msg: string) => useToastStore.getState().push('warn', msg),
  error: (msg: string) => useToastStore.getState().push('error', msg),
}
