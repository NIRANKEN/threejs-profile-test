/**
 * RoomLights
 * 部屋の雰囲気照明。GLBモデル導入後も流用できる汎用ライティング。
 */
export default function RoomLights() {
  return (
    <>
      {/* 環境光: 全体を薄く照らす */}
      <hemisphereLight args={[0xddeeff, 0x0f0e0d, 0.02]} intensity={0.5} />

      {/* メインの天井ライト */}
      <pointLight
        position={[0, 4, 0]}
        color={0xffeecc}
        intensity={60}
        distance={12}
        decay={2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.001}
      />

      {/* サイドの補助ライト（左） */}
      <pointLight
        position={[-3, 2.5, 1]}
        color={0xccddff}
        intensity={15}
        distance={8}
        decay={2}
      />

      {/* サイドの補助ライト（右） */}
      <pointLight
        position={[3, 2.5, 1]}
        color={0xffddc8}
        intensity={15}
        distance={8}
        decay={2}
      />
    </>
  )
}
