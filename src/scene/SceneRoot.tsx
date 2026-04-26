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
        環境マップ (IBL反射): CDNから取得するため失敗しても他に影響しないよう
        SceneErrorBoundary + Suspense で保護する
      */}
      <SceneErrorBoundary>
        <Suspense fallback={null}>
          <Environment preset="apartment" />
        </Suspense>
      </SceneErrorBoundary>
      <RoomModel />
      {/*
        パフォーマンス最適化:
        シーン内に動的に動く影のキャスター（キャラクターや動くライトなど）が存在しないため、
        BakeShadows を追加することで影の計算を初回のみに制限し、
        毎フレームのシャドウマップの再レンダリング（ドローコールの無駄）を削減する。
      */}
      <BakeShadows />
      {/* 開発環境のみ: XYZ軸 + カメラ座標ログ */}
      <SceneDevTools />
    </>
  )
}
