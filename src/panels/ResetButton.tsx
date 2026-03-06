import { usePortfolioStore } from '../store/usePortfolioStore'
import { OVERVIEW_CAMERA } from '../types/sections'

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
          // NaN などで移動に失敗した時のための非常手段
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
