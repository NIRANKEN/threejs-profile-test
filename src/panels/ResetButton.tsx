import { usePortfolioStore } from '../store/usePortfolioStore'

export default function ResetButton() {
  const setActiveSection = usePortfolioStore((s) => s.setActiveSection)
  const triggerReset = usePortfolioStore((s) => s.triggerReset)

  const handleReset = (): void => {
    setActiveSection(null) // パネルを閉じる
    triggerReset()         // FirstPersonController にリセット指示
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
