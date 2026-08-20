/**
 * VtuberLights
 * アウトドア・山小屋ロッジ風の温かみのあるライティング
 */

const HEMI_LIGHT_ARGS = [0xffe4b5, 0x1a2634, 0.4] as [number, number, number];
const PENDANT_LIGHT_POS = [0, 3.2, -0.75] as [number, number, number];
const SCREEN_GLOW_POS = [0, 1.8, -5.0] as [number, number, number];
const WINDOW_LIGHT_POS = [0, 5, 8] as [number, number, number];
const SHADOW_MAP_SIZE = [1024, 1024] as [number, number];

export default function VtuberLights() {
  return (
    <>
      {/* 全体環境光: 夕暮れ〜夜の温かい木造ロッジの雰囲気 */}
      <hemisphereLight args={HEMI_LIGHT_ARGS} intensity={0.6} />

      {/* ペンダントライト（ペンダントシェード内部の電球） */}
      <pointLight
        position={PENDANT_LIGHT_POS}
        color={0xffa347}
        intensity={45}
        distance={10}
        decay={2}
        castShadow
        shadow-mapSize={SHADOW_MAP_SIZE}
        shadow-bias={-0.001}
      />

      {/* 正面のムービースクリーン・シアター壁のアンビエントグロー */}
      <pointLight
        position={SCREEN_GLOW_POS}
        color={0x6699ff}
        intensity={20}
        distance={8}
        decay={2}
      />

      {/* 外窓からの柔らかな外光（山岳の夜空・夕暮れ光） */}
      <directionalLight position={WINDOW_LIGHT_POS} color={0x7090bf} intensity={0.8} castShadow />
    </>
  );
}
