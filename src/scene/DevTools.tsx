/**
 * DevTools — 開発環境専用のカメラデバッグUI
 *
 * 使い方:
 *   - <SceneDevTools /> を Canvas 内のコンポーネントとして追加
 *   - <DevHud />        を Canvas 外（App.tsx など）に追加
 *
 * import.meta.env.DEV が false の本番ビルドでは
 * 両コンポーネントとも null を返し、フックも実行されない。
 */
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { usePortfolioStore } from '../store/usePortfolioStore'

// Vector3 を毎フレーム alloc しないよう再利用
const _tgt = new Vector3()

// ─── Canvas 内コンポーネント ─────────────────────────────────────────────────
function InnerSceneDevTools() {
  const { camera } = useThree()
  const cameraControlsRef = usePortfolioStore((s) => s.cameraControlsRef)

  useFrame(() => {
    const p = camera.position

    // React の state を介さず DOM を直接更新（毎フレームの再レンダーを回避）
    const elPos = document.getElementById('dev-cam-pos')
    if (elPos) {
      elPos.textContent = `Pos  x:${p.x.toFixed(3)}  y:${p.y.toFixed(3)}  z:${p.z.toFixed(3)}`
    }

    const controls = cameraControlsRef?.current
    if (!controls) return

    controls.getTarget(_tgt)
    const elTgt = document.getElementById('dev-cam-tgt')
    if (elTgt) {
      elTgt.textContent = `Tgt  x:${_tgt.x.toFixed(3)}  y:${_tgt.y.toFixed(3)}  z:${_tgt.z.toFixed(3)}`
    }

    const elDst = document.getElementById('dev-cam-dst')
    if (elDst) {
      elDst.textContent = `Dst  ${controls.distance.toFixed(3)}`
    }
  })

  return (
    <>
      {/*
        原点 (0, 0, 0) に XYZ 座標軸を表示
          赤 (Red)   = X 軸
          緑 (Green) = Y 軸
          青 (Blue)  = Z 軸
        args[0] = 軸の長さ (units)
      */}
      <axesHelper args={[1.5]} />
    </>
  )
}

/** 開発環境のみ Scene に追加するカメラデバッグツール */
export function SceneDevTools() {
  if (!import.meta.env.DEV) return null
  return <InnerSceneDevTools />
}

// ─── Canvas 外 HTML オーバーレイ ─────────────────────────────────────────────
/** 開発環境のみ表示するカメラ座標 HUD */
export function DevHud() {
  if (!import.meta.env.DEV) return null

  return (
    <div className="dev-hud" aria-hidden="true">
      <p className="dev-hud__title">📷 Camera Debug</p>
      <p id="dev-cam-pos" className="dev-hud__row">Pos  —</p>
      <p id="dev-cam-tgt" className="dev-hud__row">Tgt  —</p>
      <p id="dev-cam-dst" className="dev-hud__row">Dst  —</p>
      <div className="dev-hud__axes">
        <span style={{ color: '#ff5555' }}>━ X</span>
        <span style={{ color: '#55ff55' }}>━ Y</span>
        <span style={{ color: '#5599ff' }}>━ Z</span>
      </div>
    </div>
  )
}
