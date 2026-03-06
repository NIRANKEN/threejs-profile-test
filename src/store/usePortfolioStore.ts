import { create } from 'zustand'
import type { RefObject } from 'react'
import type CameraControlsImpl from 'camera-controls'
import type { SectionId } from '../types/sections'

interface PortfolioState {
  activeSection: SectionId | null
  cameraControlsRef: RefObject<CameraControlsImpl | null> | null
  isTransitioning: boolean

  setActiveSection: (section: SectionId | null) => void
  setCameraControlsRef: (ref: RefObject<CameraControlsImpl | null>) => void
  setTransitioning: (v: boolean) => void
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  activeSection: null,
  cameraControlsRef: null,
  isTransitioning: false,

  setActiveSection: (section) => set({ activeSection: section }),
  setCameraControlsRef: (ref) => set({ cameraControlsRef: ref }),
  setTransitioning: (v) => set({ isTransitioning: v }),
}))
