import type { Page } from '@playwright/test'
import type { SectionId } from '../src/types/sections'

// ─── DevHud テキストパーサー ──────────────────────────────────────────────────

/** "Pos  x:0.000  y:1.600  z:1.500" → { x, y, z } */
export function parsePos(text: string): { x: number; y: number; z: number } {
  const m = text.match(/x:([-\d.]+)\s+y:([-\d.]+)\s+z:([-\d.]+)/)
  if (!m) throw new Error(`Cannot parse position: "${text}"`)
  return { x: parseFloat(m[1]), y: parseFloat(m[2]), z: parseFloat(m[3]) }
}

/** "Rot  yaw:0.000  pitch:0.000" → { yaw, pitch } */
export function parseRot(text: string): { yaw: number; pitch: number } {
  const m = text.match(/yaw:([-\d.]+)\s+pitch:([-\d.]+)/)
  if (!m) throw new Error(`Cannot parse rotation: "${text}"`)
  return { yaw: parseFloat(m[1]), pitch: parseFloat(m[2]) }
}

// ─── カメラ状態取得ヘルパー ──────────────────────────────────────────────────

export async function getCameraPos(page: Page): Promise<{ x: number; y: number; z: number }> {
  const text = await page.locator('#dev-cam-pos').textContent()
  return parsePos(text ?? '')
}

export async function getCameraRot(page: Page): Promise<{ yaw: number; pitch: number }> {
  const text = await page.locator('#dev-cam-rot').textContent()
  return parseRot(text ?? '')
}

// ─── Three.js レンダリング待機 ────────────────────────────────────────────────

/**
 * シーンが起動したことを確認する。
 * 1. canvas 要素が DOM に存在すること
 * 2. dev モードの window.__portfolioStore が有効なこと
 * 3. DevHud の位置テキストが "x:" を含む（Three.js の useFrame が動いている）こと
 */
export async function waitForScene(page: Page): Promise<void> {
  // canvas が表示されるまで待機
  await page.waitForSelector('canvas', { timeout: 20_000 })

  // __portfolioStore が window に公開されるまで待機（dev モード）
  await page.waitForFunction(
    () => !!(window as Window & { __portfolioStore?: unknown }).__portfolioStore,
    { timeout: 20_000 },
  )

  // DevHud が Three.js の useFrame から更新されるまで待機
  await page.waitForFunction(
    () => {
      const el = document.getElementById('dev-cam-pos')
      return el !== null && el.textContent !== null && el.textContent.includes('x:')
    },
    { timeout: 30_000 },
  )
}

// ─── Zustand ストア操作（Dev モード専用）────────────────────────────────────

type StoreState = {
  setActiveSection: (id: SectionId | null) => void
  isTransitioning: boolean
}
type StoreWindow = Window & {
  __portfolioStore?: { getState: () => StoreState }
}

/** Playwright から Zustand ストアの setActiveSection を呼び出す */
export async function setActiveSection(
  page: Page,
  section: SectionId | null,
): Promise<void> {
  await page.evaluate((id) => {
    ;(window as StoreWindow).__portfolioStore?.getState().setActiveSection(id)
  }, section)
}

/**
 * isTransitioning が false になるまで待機する。
 * セクション遷移アニメーション完了後に ESC などを押す際に使用する。
 */
export async function waitForTransitionDone(page: Page, timeoutMs = 10_000): Promise<void> {
  await page.waitForFunction(
    () => {
      const store = (window as StoreWindow).__portfolioStore
      return store ? !store.getState().isTransitioning : false
    },
    { timeout: timeoutMs },
  )
}

// ─── カメラ位置の安定待機 ─────────────────────────────────────────────────────

/**
 * 位置が変化しなくなるまで待機する（遷移アニメーション完了の検出）。
 * 2フレーム連続で同じ値なら安定とみなす。
 */
export async function waitForPositionStable(page: Page, timeoutMs = 5_000): Promise<void> {
  const start = Date.now()
  let prev = ''
  while (Date.now() - start < timeoutMs) {
    const text = await page.locator('#dev-cam-pos').textContent()
    if (text === prev && prev !== '' && !prev.includes('—')) break
    prev = text ?? ''
    await page.waitForTimeout(100)
  }
}
