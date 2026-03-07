import { Suspense, Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import SceneRoot from './scene/SceneRoot'
import PanelOverlay from './panels/PanelOverlay'
import HelpButton from './panels/HelpButton'
import ResetButton from './panels/ResetButton'
import { DevHud } from './scene/DevTools'
import { OVERVIEW_CAMERA } from './types/sections'

// ─── Error Boundary ───────────────────────────────────────────────────────────
interface EBState { error: Error | null }
class ErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { error: null }
  static getDerivedStateFromError(error: Error): EBState { return { error } }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <div className="error-boundary">
          <h2 className="error-boundary__title">⚠ Render Error</h2>
          <pre className="error-boundary__pre">
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            className="error-boundary__retry"
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Loading Screen ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return <div className="loading-screen">Loading...</div>
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <Suspense fallback={<LoadingScreen />}>
          <Canvas
            shadows
            camera={{ fov: 60, near: 0.01, far: 100, position: OVERVIEW_CAMERA.position }}
            gl={{ antialias: true }}
          >
            <SceneRoot />
          </Canvas>
        </Suspense>

        {/* PanelOverlayはCanvas外に配置してHTMLとして自由にスタイリング可能にする */}
        <PanelOverlay />
        {/* ヘルプボタン: 左下に固定表示 */}
        <HelpButton />
        {/* リセットボタン: ヘルプボタンの上に表示 */}
        <ResetButton />
        {/* 開発環境のみ: カメラ座標 HUD */}
        <DevHud />
      </div>
    </ErrorBoundary>
  )
}
