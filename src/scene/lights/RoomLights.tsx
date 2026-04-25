/**
 * RoomLights
 * 部屋の雰囲気照明。GLBモデル導入後も流用できる汎用ライティング。
 */

// ─── 定数 (GC対策: 再レンダリング時の新規配列生成を回避) ──────────────────────
const HEMI_LIGHT_ARGS = [0xddeeff, 0x0f0e0d, 0.02] as [number, number, number]
const MAIN_LIGHT_POS = [0, 4, 0] as [number, number, number]
const SHADOW_MAP_SIZE = [1024, 1024] as [number, number]
const SIDE_LIGHT_L_POS = [-3, 2.5, 1] as [number, number, number]
const SIDE_LIGHT_R_POS = [3, 2.5, 1] as [number, number, number]

export default function RoomLights() {
  return (
    <>
      {/* 環境光: 全体を薄く照らす */}
      <hemisphereLight args={HEMI_LIGHT_ARGS} intensity={0.5} />

      {/* メインの天井ライト */}
      <pointLight
        position={MAIN_LIGHT_POS}
        color={0xffeecc}
        intensity={60}
        distance={12}
        decay={2}
        castShadow
        shadow-mapSize={SHADOW_MAP_SIZE}
        shadow-bias={-0.001}
      />

      {/* サイドの補助ライト（左） */}
      <pointLight
        position={SIDE_LIGHT_L_POS}
        color={0xccddff}
        intensity={15}
        distance={8}
        decay={2}
      />

      {/* サイドの補助ライト（右） */}
      <pointLight
        position={SIDE_LIGHT_R_POS}
        color={0xffddc8}
        intensity={15}
        distance={8}
        decay={2}
      />
    </>
  )
}
