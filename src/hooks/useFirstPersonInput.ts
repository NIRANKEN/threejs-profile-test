import { useRef, useEffect } from 'react'

/**
 * WASD キーの押下状態を追跡するフック。
 * Set<string> を useRef で保持し、useFrame 内から直接参照できる（再レンダリングなし）。
 * キーは e.code ベース（'KeyW', 'KeyA', 'KeyS', 'KeyD'）でレイアウト非依存。
 */
export function useFirstPersonInput(): React.MutableRefObject<Set<string>> {
  const keysRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      keysRef.current.add(e.code)
    }
    const onKeyUp = (e: KeyboardEvent): void => {
      keysRef.current.delete(e.code)
    }
    // タブ非アクティブ時に keyup が発火しないためキーをクリア
    const onBlur = (): void => {
      keysRef.current.clear()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  return keysRef
}
