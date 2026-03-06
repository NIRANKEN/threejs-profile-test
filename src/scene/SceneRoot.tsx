import { Suspense, Component } from 'react'
import type { ReactNode } from 'react'
import { Environment } from '@react-three/drei'
import CameraController from './CameraController'
import RoomLights from './lights/RoomLights'
import { RoomModel } from './RoomModel'
import { SceneDevTools } from './DevTools'

/**
 * Canvas内用の軽量エラーバウンダリ
 * Environment の CDN フェッチが失敗してもシーン全体を壊さない
 */
class SceneErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(e: unknown) { console.warn('[SceneErrorBoundary] caught:', e) }
  render() {
    return this.state.hasError
      ? (this.props.fallback ?? null)
      : this.props.children
  }
}

export default function SceneRoot() {
  return (
    <>
      <CameraController />
      <RoomLights />
      {/*
        環境マップ (IBL反射): CDNから取得するため失敗しても他に影響しないよう
        SceneErrorBoundary + Suspense で保護する
      */}
      <SceneErrorBoundary>
        <Suspense fallback={null}>
          <Environment preset="apartment" />
        </Suspense>
      </SceneErrorBoundary>
      <RoomModel />
      {/* 開発環境のみ: XYZ軸 + カメラ座標ログ */}
      <SceneDevTools />
    </>
  )
}
