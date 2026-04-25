export type SectionId = 'profile' | 'skills' | 'works' | 'contact'

/**
 * 一人称カメラの姿勢（位置 + Yaw + Pitch）
 *   yaw:   Y軸回転（左右）[radians]
 *   pitch: X軸回転（上下）[radians]、±70°以内
 */
export interface CameraOrientation {
  position: [number, number, number]
  yaw: number
  pitch: number
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
 * position + target から一人称カメラの yaw/pitch を算出する内部ユーティリティ。
 * Three.js の rotation.order='YXZ' 規約に準拠。
 */
function lookAtToYawPitch(
  position: [number, number, number],
  target: [number, number, number],
): { yaw: number; pitch: number } {
  const dx = target[0] - position[0]
  const dy = target[1] - position[1]
  const dz = target[2] - position[2]
  // Three.js YXZ: カメラは既定で -Z を向く。右向きが正の yaw
  const yaw = Math.atan2(-dx, -dz)
  const dist = Math.sqrt(dx * dx + dz * dz)
  const pitch = Math.atan2(dy, dist)
  return { yaw, pitch }
}

/**
 * 初期姿勢: 部屋中央手前・目線の高さ・正面（-Z方向）向き
 */
export const INITIAL_ORIENTATION: CameraOrientation = {
  position: [0, 1.6, 1.5],
  yaw: 0,
  pitch: 0,
}

/**
 * 各セクション選択時の固定視点。
 * 旧 SECTION_CAMERAS の position + target を yaw/pitch に変換して定義。
 */
export const SECTION_ORIENTATIONS: Record<SectionId, CameraOrientation> = {
  // Profile: ベッドを見る
  profile: {
    position: [-1.0, 1.6, -0.36],
    ...lookAtToYawPitch([-1.0, 1.6, -0.36], [2.31, 0.57, 1.14]),
  },
  // Skills: PCケースの正面から見る
  skills: {
    position: [-1.4, 1.6, 0.8],
    ...lookAtToYawPitch([-1.4, 1.6, 0.8], [-1.5, 0.6, -1.6]),
  },
  // Works: モニターの正面から見る
  works: {
    position: [-1.5, 1.6, 0.5],
    ...lookAtToYawPitch([-1.5, 1.6, 0.5], [-2.3, 1.4, -1.8]),
  },
  // Contact: 本の正面から見る
  contact: {
    position: [1.5, 1.6, 0.5],
    ...lookAtToYawPitch([1.5, 1.6, 0.5], [1.8, 1.1, -1.7]),
  },
}
