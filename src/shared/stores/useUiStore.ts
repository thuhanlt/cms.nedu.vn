import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PreviewDevice = 'desktop' | 'mobile'

interface UiState {
  sidebarMini: boolean
  previewDevice: PreviewDevice
  previewFullscreen: boolean
  toggleSidebar: () => void
  setSidebarMini: (mini: boolean) => void
  setPreviewDevice: (d: PreviewDevice) => void
  togglePreviewFullscreen: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarMini: false,
      previewDevice: 'desktop',
      previewFullscreen: false,
      toggleSidebar: () => set((s) => ({ sidebarMini: !s.sidebarMini })),
      setSidebarMini: (mini) => set({ sidebarMini: mini }),
      setPreviewDevice: (previewDevice) => set({ previewDevice }),
      togglePreviewFullscreen: () => set((s) => ({ previewFullscreen: !s.previewFullscreen })),
    }),
    {
      name: 'nedu_cms_ui',
      partialize: (s) => ({ sidebarMini: s.sidebarMini, previewDevice: s.previewDevice }),
    },
  ),
)
