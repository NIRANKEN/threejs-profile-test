export type SceneMode = "real" | "virtual";

export type RealSectionId = "profile" | "skills" | "works" | "contact";
export type VtuberSectionId = "profile" | "works" | "guidelines" | "links" | "contact";
export type SectionId = RealSectionId | VtuberSectionId;

/**
 * 一人称カメラの姿勢（位置 + Yaw + Pitch）
 *   yaw:   Y軸回転（左右）[radians]
 *   pitch: X軸回転（上下）[radians]、±70°以内
 */
export interface CameraOrientation {
  position: [number, number, number];
  yaw: number;
  pitch: number;
}

export interface RoomBounds {
  xMin: number;
  xMax: number;
  yFixed: number;
  zMin: number;
  zMax: number;
}

/**
 * position + target から一人称カメラの yaw/pitch を算出する内部ユーティリティ。
 * Three.js の rotation.order='YXZ' 規約に準拠。
 */
export function lookAtToYawPitch(
  position: [number, number, number],
  target: [number, number, number],
): { yaw: number; pitch: number } {
  const dx = target[0] - position[0];
  const dy = target[1] - position[1];
  const dz = target[2] - position[2];
  // Three.js YXZ: カメラは既定で -Z を向く。右向きが正の yaw
  const yaw = Math.atan2(-dx, -dz);
  const dist = Math.sqrt(dx * dx + dz * dz);
  const pitch = Math.atan2(dy, dist);
  return { yaw, pitch };
}

// ─── REAL (Engineer Room) ───────────────────────────────────────────────────

export const REAL_ROOM_BOUNDS: RoomBounds = {
  xMin: -2.8,
  xMax: 2.8,
  yFixed: 1.6,
  zMin: -2.0,
  zMax: 2.0,
};

export const REAL_INITIAL_ORIENTATION: CameraOrientation = {
  position: [0, 1.6, 1.5],
  yaw: 0,
  pitch: 0,
};

export const REAL_SECTION_ORIENTATIONS: Record<RealSectionId, CameraOrientation> = {
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
};

// ─── VIRTUAL (Vtuber Mountain Movie Lounge) ──────────────────────────────────

export const VTUBER_ROOM_BOUNDS: RoomBounds = {
  xMin: -3.2,
  xMax: 3.2,
  yFixed: 1.6,
  zMin: -4.8,
  zMax: 1.8,
};

export const VTUBER_INITIAL_ORIENTATION: CameraOrientation = {
  position: [0, 1.6, 1.0],
  yaw: 0,
  pitch: 0,
};

export const VTUBER_SECTION_ORIENTATIONS: Record<VtuberSectionId, CameraOrientation> = {
  // Profile: 部屋の中心からソファ・キャラクターエリアを見る
  profile: {
    position: [-0.3, 1.6, -2.1],
    ...lookAtToYawPitch([-1.4, 1.6, -3.3], [0.4, 0.8, -1.3]),
  },
  // Works: 正面のムービースクリーン・シアター壁を見る
  works: {
    position: [0, 1.6, -1.5],
    ...lookAtToYawPitch([0, 1.6, -1.5], [0, 1.8, -5.8]),
  },
  // Guidelines: ラウンジのテーブル・ルール案内を見る
  guidelines: {
    position: [1.6, 1.5, -0.4],
    ...lookAtToYawPitch([1.6, 1.5, -0.4], [2.6, 0.7, -1.4]),
  },
  // Links: ランタン・サイドラック・出入口を見る
  links: {
    position: [-1.6, 1.5, -0.4],
    ...lookAtToYawPitch([-1.6, 1.5, -0.4], [-2.6, 1.2, -1.4]),
  },
  // Contact (互換性)
  contact: {
    position: [1.2, 1.5, 0.5],
    ...lookAtToYawPitch([1.2, 1.5, 0.5], [0, 1.0, -1.0]),
  },
};

// ─── 互換エイリアス & シーン別マップ ─────────────────────────────────────────

export const INITIAL_ORIENTATION = REAL_INITIAL_ORIENTATION;
export const SECTION_ORIENTATIONS = REAL_SECTION_ORIENTATIONS;

export const SCENE_INITIAL_ORIENTATION: Record<SceneMode, CameraOrientation> = {
  real: REAL_INITIAL_ORIENTATION,
  virtual: VTUBER_INITIAL_ORIENTATION,
};

export const SCENE_ROOM_BOUNDS: Record<SceneMode, RoomBounds> = {
  real: REAL_ROOM_BOUNDS,
  virtual: VTUBER_ROOM_BOUNDS,
};

export const SCENE_SECTION_ORIENTATIONS: Record<SceneMode, Record<string, CameraOrientation>> = {
  real: REAL_SECTION_ORIENTATIONS as Record<string, CameraOrientation>,
  virtual: VTUBER_SECTION_ORIENTATIONS as Record<string, CameraOrientation>,
};
