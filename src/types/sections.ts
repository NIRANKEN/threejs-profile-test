export type SectionId = 'profile' | 'skills' | 'works' | 'contact'

export interface CameraPosition {
  position: [number, number, number]
  target: [number, number, number]
}

/**
 * GLBモデル座標系メモ (scale=0.913 で各オブジェクトのワールド座標)
 *   Bed      [2.31,  0.57,  1.14]
 *   PC Case  [-1.39, 0.41, -1.61]
 *   Monitor  [-2.31, 1.36, -1.83]
 *   Book     [1.84,  1.12, -1.74]
 *   Room     X:-2.5〜+2.5, Y:0〜3.1, Z:-2.2〜+2.0
 */

/**
 * 概観カメラ: 部屋の内側中央付近から室内全体を見渡す初期位置。
 * Canvas の camera.position と合わせること。
 *   position: 部屋中央・手前 (z=1.5)、目線の高さ (y=1.6)
 *   target:   部屋の中心やや奥を注視
 */
export const OVERVIEW_CAMERA: CameraPosition = {
  position: [0, 1.6, 1.5],
  target: [0, 1.6, 0],
}

export const SECTION_CAMERAS: Record<SectionId, CameraPosition> = {
  // Profile: ベッドの足元から頭部方向を見る
  profile: { position: [-0.5, 1.6, 0.5], target: [2.3, 0.6, 1.1] },
  // Skills: PCケースの正面から見る
  skills: { position: [-0.5, 1.2, -1.0], target: [-1.5, 0.4, -1.7] },
  // Works: モニターの正面から見る
  works: { position: [-1.5, 1.4, -1.0], target: [-2.3, 1.4, -2.0] },
  // Contact: 本の正面から見る
  contact: { position: [1.0, 1.4, -1.0], target: [2.0, 1.2, -1.9] },
}
