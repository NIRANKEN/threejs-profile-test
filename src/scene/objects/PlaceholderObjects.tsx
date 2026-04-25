/**
 * PlaceholderObjects
 *
 * GLBモデル統合前の仮ジオメトリ。
 * 各セクションに対応した色付きボックスで動作確認を行う。
 * RoomModel.tsx が完成したらこのファイルは削除する。
 */
import InteractiveObject from './InteractiveObject'

// 部屋の床（非インタラクティブ）
function Floor() {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[12, 12]} />
      <meshStandardMaterial color="#2a2a3a" roughness={0.9} metalness={0.1} />
    </mesh>
  )
}

// 壁（非インタラクティブ）
function Walls() {
  return (
    <group>
      {/* 奥の壁 */}
      <mesh position={[0, 2, -5]} receiveShadow>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#1e1e2e" roughness={0.85} />
      </mesh>
      {/* 左の壁 */}
      <mesh position={[-5, 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.85} />
      </mesh>
      {/* 右の壁 */}
      <mesh position={[5, 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.85} />
      </mesh>
    </group>
  )
}

// Profile: デスク + 人物（青）
export function ProfilePlaceholder() {
  return (
    <InteractiveObject sectionId="profile" label="Profile" tooltipPosition={[0, 1.5, 0]}>
      <group position={[0, 0, 0]}>
        {/* デスク */}
        <mesh position={[0, 0.3, -1]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.08, 0.8]} />
          <meshStandardMaterial color="#4a7fa5" roughness={0.6} />
        </mesh>
        {/* 人物（シリンダー） */}
        <mesh position={[0, 0.65, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.9, 16]} />
          <meshStandardMaterial color="#5b9bd5" roughness={0.5} emissive="#1a3a5c" emissiveIntensity={0.3} />
        </mesh>
        {/* 頭 */}
        <mesh position={[0, 1.25, 0]} castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#5b9bd5" roughness={0.5} emissive="#1a3a5c" emissiveIntensity={0.3} />
        </mesh>
        {/* ラベル用ライトアップ */}
        <pointLight position={[0, 2, 0.5]} intensity={0.3} color="#5b9bd5" distance={3} />
      </group>
    </InteractiveObject>
  )
}

// Skills: 本棚（緑）
export function SkillsPlaceholder() {
  return (
    <InteractiveObject sectionId="skills" label="Skills" tooltipPosition={[-3, 2.5, -2]}>
      <group position={[-3, 0, -2]}>
        {/* 棚本体 */}
        <mesh position={[0, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 2, 0.4]} />
          <meshStandardMaterial color="#2e7d52" roughness={0.7} />
        </mesh>
        {/* 本①〜④ */}
        {[0.3, 0.1, -0.1, -0.3].map((x, i) => (
          <mesh key={i} position={[x, 0.6 + (i % 2) * 0.5, -0.1]} castShadow>
            <boxGeometry args={[0.15, 0.4, 0.25]} />
            <meshStandardMaterial
              color={['#e74c3c', '#3498db', '#f39c12', '#9b59b6'][i]}
              roughness={0.6}
              emissive={['#e74c3c', '#3498db', '#f39c12', '#9b59b6'][i]}
              emissiveIntensity={0.15}
            />
          </mesh>
        ))}
        <pointLight position={[0, 2.5, 0.5]} intensity={0.3} color="#4ade80" distance={3} />
      </group>
    </InteractiveObject>
  )
}

// Works: PC・モニター（オレンジ）
export function WorksPlaceholder() {
  return (
    <InteractiveObject sectionId="works" label="Works" tooltipPosition={[0, 2, -1]}>
      <group position={[0, 0, -1]}>
        {/* モニター */}
        <mesh position={[0, 1.1, -0.8]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.85, 0.07]} />
          <meshStandardMaterial color="#e67e22" roughness={0.4} metalness={0.5} emissive="#7a3500" emissiveIntensity={0.4} />
        </mesh>
        {/* 画面 */}
        <mesh position={[0, 1.1, -0.76]}>
          <planeGeometry args={[1.2, 0.65]} />
          <meshStandardMaterial color="#000510" emissive="#0050ff" emissiveIntensity={0.6} />
        </mesh>
        {/* スタンド */}
        <mesh position={[0, 0.55, -0.8]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
          <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
        </mesh>
        <pointLight position={[0, 2, 0]} intensity={0.4} color="#f97316" distance={3} />
      </group>
    </InteractiveObject>
  )
}

// Contact: ポスター（ピンク）
export function ContactPlaceholder() {
  return (
    <InteractiveObject sectionId="contact" label="Contact" tooltipPosition={[3, 2.5, -2]}>
      <group position={[3, 0, -2]}>
        {/* ポスターフレーム */}
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 1.2, 0.06]} />
          <meshStandardMaterial color="#c0392b" roughness={0.5} emissive="#600010" emissiveIntensity={0.4} />
        </mesh>
        {/* ポスター内の絵 */}
        <mesh position={[0, 1.5, 0.04]}>
          <planeGeometry args={[0.7, 1.0]} />
          <meshStandardMaterial color="#1a0010" emissive="#ff69b4" emissiveIntensity={0.5} />
        </mesh>
        <pointLight position={[0, 2.5, 0.8]} intensity={0.3} color="#f472b6" distance={3} />
      </group>
    </InteractiveObject>
  )
}

// すべての仮オブジェクトをまとめてエクスポート
export default function PlaceholderObjects() {
  return (
    <>
      <Floor />
      <Walls />
      <ProfilePlaceholder />
      <SkillsPlaceholder />
      <WorksPlaceholder />
      <ContactPlaceholder />
    </>
  )
}
