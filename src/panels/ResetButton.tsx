import { Vector3 } from 'three'
import { usePortfolioStore } from '../store/usePortfolioStore'
import { OVERVIEW_CAMERA } from '../types/sections'

const _pos = new Vector3()
const _tgt = new Vector3()

export default function ResetButton() {
  const setActiveSection = usePortfolioStore((s) => s.setActiveSection)
  const cameraControlsRef = usePortfolioStore((s) => s.cameraControlsRef)
  const setTransitioning = usePortfolioStore((s) => s.setTransitioning)

  const handleReset = () => {
    // セクション選択を解除
    setActiveSection(null)

    // カメラを初期位置にリセット
    const controls = cameraControlsRef?.current
    if (controls) {
      // 異常値 (NaN) チェック
      controls.getPosition(_pos)
      controls.getTarget(_tgt)
      const isInvalid = [_pos.x, _pos.y, _pos.z, _tgt.x, _tgt.y, _tgt.z].some(isNaN)

      if (isInvalid) {
        // すでに NaN の場合はアニメーションさせずに即座にリセット
        controls.setLookAt(
          OVERVIEW_CAMERA.position[0],
          OVERVIEW_CAMERA.position[1],
          OVERVIEW_CAMERA.position[2],
          OVERVIEW_CAMERA.target[0],
          OVERVIEW_CAMERA.target[1],
          OVERVIEW_CAMERA.target[2],
          false // 即時
        )
        return
      }

      setTransitioning(true)
      controls
        .setLookAt(
          OVERVIEW_CAMERA.position[0],
          OVERVIEW_CAMERA.position[1],
          OVERVIEW_CAMERA.position[2],
          OVERVIEW_CAMERA.target[0],
          OVERVIEW_CAMERA.target[1],
          OVERVIEW_CAMERA.target[2],
          true // スムーズに移動
        )
        .then(() => {
          setTransitioning(false)
        })
        .catch(() => {
          // 移動に失敗した時のための非常手段
          controls.reset(false)
          setTransitioning(false)
        })
    }
  }

  return (
    <button
      className="reset-btn"
      onClick={handleReset}
      aria-label="カメラを初期位置にリセット"
      title="視点をリセット"
    >
      🏠
    </button>
  )
}
