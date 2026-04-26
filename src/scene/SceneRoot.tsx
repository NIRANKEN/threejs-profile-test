import { Suspense, Component } from 'react'
import type { ReactNode } from 'react'
import { Environment, BakeShadows } from '@react-three/drei'
import FirstPersonController from './FirstPersonController'
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
      <FirstPersonController />
      <RoomLights />
      {/*
        Environment・RoomModel・BakeShadows を同じ Suspense に入れる理由:
        - 別々の境界にすると room.glb が先に解決し、IBL なしのモデルが一瞬描画される
        - SceneErrorBoundary を Environment だけに内包することで
          CDN 失敗時は Environment のみ null になり、RoomModel は必ず表示される
        - BakeShadows は全アセット解決後にシャドウを焼き付けられる
      */}
      <Suspense fallback={null}>
        <SceneErrorBoundary>
          <Environment preset="apartment" />
        </SceneErrorBoundary>
        <RoomModel />
        <BakeShadows />
      </Suspense>
      {/* 開発環境のみ: XYZ軸 + カメラ座標ログ */}
      <SceneDevTools />
    </>
  )
}
