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
        <div style={{
          position: 'fixed', inset: 0, background: '#0f0f14', color: '#ff6b6b',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '2rem', fontFamily: 'monospace',
        }}>
          <h2 style={{ margin: '0 0 1rem', color: '#ff6b6b' }}>⚠ Render Error</h2>
          <pre style={{
            background: '#1a1a2e', padding: '1.5rem', borderRadius: '8px',
            maxWidth: '90vw', overflow: 'auto', fontSize: '0.8rem', lineHeight: 1.6,
            color: '#e0e0e0', whiteSpace: 'pre-wrap',
          }}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              marginTop: '1.5rem', padding: '0.6em 1.5em', background: '#646cff',
              color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.9rem',
            }}
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
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f0f14',
        color: 'white',
        fontSize: '1.2rem',
        letterSpacing: '0.05em',
      }}
    >
      Loading...
    </div>
  )
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
