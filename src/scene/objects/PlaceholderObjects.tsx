/**
 * PlaceholderObjects
 *
 * GLBモデル統合前の仮ジオメトリ。
 * 各セクションに対応した色付きボックスで動作確認を行う。
 * RoomModel.tsx が完成したらこのファイルは削除する。
 */
import InteractiveObject from "./InteractiveObject";
import type { Vector3, Euler } from "@react-three/fiber";

// --- Constants to prevent re-allocations on render ---
const FLOOR_ROTATION: Euler = [-Math.PI / 2, 0, 0];
const FLOOR_POSITION: Vector3 = [0, -0.01, 0];
const FLOOR_ARGS: [number, number] = [12, 12];

const WALL_BACK_POSITION: Vector3 = [0, 2, -5];
const WALL_BACK_ARGS: [number, number] = [12, 6];
const WALL_LEFT_POSITION: Vector3 = [-5, 2, 0];
const WALL_LEFT_ROTATION: Euler = [0, Math.PI / 2, 0];
const WALL_LEFT_ARGS: [number, number] = [10, 6];
const WALL_RIGHT_POSITION: Vector3 = [5, 2, 0];
const WALL_RIGHT_ROTATION: Euler = [0, -Math.PI / 2, 0];
const WALL_RIGHT_ARGS: [number, number] = [10, 6];

const PROFILE_GROUP_POSITION: Vector3 = [0, 0, 0];
const PROFILE_DESK_POSITION: Vector3 = [0, 0.3, -1];
const PROFILE_DESK_ARGS: [number, number, number] = [1.8, 0.08, 0.8];
const PROFILE_PERSON_POSITION: Vector3 = [0, 0.65, 0];
const PROFILE_PERSON_ARGS: [number, number, number, number] = [0.18, 0.18, 0.9, 16];
const PROFILE_HEAD_POSITION: Vector3 = [0, 1.25, 0];
const PROFILE_HEAD_ARGS: [number, number, number] = [0.2, 16, 16];
const PROFILE_LIGHT_POSITION: Vector3 = [0, 2, 0.5];

const SKILLS_GROUP_POSITION: Vector3 = [-3, 0, -2];
const SKILLS_SHELF_POSITION: Vector3 = [0, 1, 0];
const SKILLS_SHELF_ARGS: [number, number, number] = [1.2, 2, 0.4];
const SKILLS_BOOK_ARGS: [number, number, number] = [0.15, 0.4, 0.25];
const SKILLS_LIGHT_POSITION: Vector3 = [0, 2.5, 0.5];

// Pre-calculate the book positions and colors to avoid inline creation within the map function
const SKILLS_BOOKS = [
  { position: [0.3, 0.6 + (0 % 2) * 0.5, -0.1] as Vector3, color: "#e74c3c" },
  { position: [0.1, 0.6 + (1 % 2) * 0.5, -0.1] as Vector3, color: "#3498db" },
  { position: [-0.1, 0.6 + (2 % 2) * 0.5, -0.1] as Vector3, color: "#f39c12" },
  { position: [-0.3, 0.6 + (3 % 2) * 0.5, -0.1] as Vector3, color: "#9b59b6" },
];

const WORKS_GROUP_POSITION: Vector3 = [0, 0, -1];
const WORKS_MONITOR_POSITION: Vector3 = [0, 1.1, -0.8];
const WORKS_MONITOR_ARGS: [number, number, number] = [1.4, 0.85, 0.07];
const WORKS_SCREEN_POSITION: Vector3 = [0, 1.1, -0.76];
const WORKS_SCREEN_ARGS: [number, number] = [1.2, 0.65];
const WORKS_STAND_POSITION: Vector3 = [0, 0.55, -0.8];
const WORKS_STAND_ARGS: [number, number, number, number] = [0.04, 0.04, 0.7, 8];
const WORKS_LIGHT_POSITION: Vector3 = [0, 2, 0];

const CONTACT_GROUP_POSITION: Vector3 = [3, 0, -2];
const CONTACT_FRAME_POSITION: Vector3 = [0, 1.5, 0];
const CONTACT_FRAME_ARGS: [number, number, number] = [0.9, 1.2, 0.06];
const CONTACT_POSTER_POSITION: Vector3 = [0, 1.5, 0.04];
const CONTACT_POSTER_ARGS: [number, number] = [0.7, 1.0];
const CONTACT_LIGHT_POSITION: Vector3 = [0, 2.5, 0.8];
// -----------------------------------------------------

// 部屋の床（非インタラクティブ）
function Floor() {
  return (
    <mesh receiveShadow rotation={FLOOR_ROTATION} position={FLOOR_POSITION}>
      <planeGeometry args={FLOOR_ARGS} />
      <meshStandardMaterial color="#2a2a3a" roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

// 壁（非インタラクティブ）
function Walls() {
  return (
    <group>
      {/* 奥の壁 */}
      <mesh position={WALL_BACK_POSITION} receiveShadow>
        <planeGeometry args={WALL_BACK_ARGS} />
        <meshStandardMaterial color="#1e1e2e" roughness={0.85} />
      </mesh>
      {/* 左の壁 */}
      <mesh position={WALL_LEFT_POSITION} rotation={WALL_LEFT_ROTATION} receiveShadow>
        <planeGeometry args={WALL_LEFT_ARGS} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.85} />
      </mesh>
      {/* 右の壁 */}
      <mesh position={WALL_RIGHT_POSITION} rotation={WALL_RIGHT_ROTATION} receiveShadow>
        <planeGeometry args={WALL_RIGHT_ARGS} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.85} />
      </mesh>
    </group>
  );
}

// Profile: デスク + 人物（青）
export function ProfilePlaceholder() {
  return (
    <InteractiveObject sectionId="profile">
      <group position={PROFILE_GROUP_POSITION}>
        {/* デスク */}
        <mesh position={PROFILE_DESK_POSITION} castShadow receiveShadow>
          <boxGeometry args={PROFILE_DESK_ARGS} />
          <meshStandardMaterial color="#4a7fa5" roughness={0.6} />
        </mesh>
        {/* 人物（シリンダー） */}
        <mesh position={PROFILE_PERSON_POSITION} castShadow>
          <cylinderGeometry args={PROFILE_PERSON_ARGS} />
          <meshStandardMaterial
            color="#5b9bd5"
            roughness={0.5}
            emissive="#1a3a5c"
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* 頭 */}
        <mesh position={PROFILE_HEAD_POSITION} castShadow>
          <sphereGeometry args={PROFILE_HEAD_ARGS} />
          <meshStandardMaterial
            color="#5b9bd5"
            roughness={0.5}
            emissive="#1a3a5c"
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* ラベル用ライトアップ */}
        <pointLight
          position={PROFILE_LIGHT_POSITION}
          intensity={0.3}
          color="#5b9bd5"
          distance={3}
        />
      </group>
    </InteractiveObject>
  );
}

// Skills: 本棚（緑）
export function SkillsPlaceholder() {
  return (
    <InteractiveObject sectionId="skills">
      <group position={SKILLS_GROUP_POSITION}>
        {/* 棚本体 */}
        <mesh position={SKILLS_SHELF_POSITION} castShadow receiveShadow>
          <boxGeometry args={SKILLS_SHELF_ARGS} />
          <meshStandardMaterial color="#2e7d52" roughness={0.7} />
        </mesh>
        {/* 本①〜④ */}
        {SKILLS_BOOKS.map((book, i) => (
          <mesh key={i} position={book.position} castShadow>
            <boxGeometry args={SKILLS_BOOK_ARGS} />
            <meshStandardMaterial
              color={book.color}
              roughness={0.6}
              emissive={book.color}
              emissiveIntensity={0.15}
            />
          </mesh>
        ))}
        <pointLight position={SKILLS_LIGHT_POSITION} intensity={0.3} color="#4ade80" distance={3} />
      </group>
    </InteractiveObject>
  );
}

// Works: PC・モニター（オレンジ）
export function WorksPlaceholder() {
  return (
    <InteractiveObject sectionId="works">
      <group position={WORKS_GROUP_POSITION}>
        {/* モニター */}
        <mesh position={WORKS_MONITOR_POSITION} castShadow receiveShadow>
          <boxGeometry args={WORKS_MONITOR_ARGS} />
          <meshStandardMaterial
            color="#e67e22"
            roughness={0.4}
            metalness={0.5}
            emissive="#7a3500"
            emissiveIntensity={0.4}
          />
        </mesh>
        {/* 画面 */}
        <mesh position={WORKS_SCREEN_POSITION}>
          <planeGeometry args={WORKS_SCREEN_ARGS} />
          <meshStandardMaterial color="#000510" emissive="#0050ff" emissiveIntensity={0.6} />
        </mesh>
        {/* スタンド */}
        <mesh position={WORKS_STAND_POSITION} castShadow>
          <cylinderGeometry args={WORKS_STAND_ARGS} />
          <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
        </mesh>
        <pointLight position={WORKS_LIGHT_POSITION} intensity={0.4} color="#f97316" distance={3} />
      </group>
    </InteractiveObject>
  );
}

// Contact: ポスター（ピンク）
export function ContactPlaceholder() {
  return (
    <InteractiveObject sectionId="contact">
      <group position={CONTACT_GROUP_POSITION}>
        {/* ポスターフレーム */}
        <mesh position={CONTACT_FRAME_POSITION} castShadow receiveShadow>
          <boxGeometry args={CONTACT_FRAME_ARGS} />
          <meshStandardMaterial
            color="#c0392b"
            roughness={0.5}
            emissive="#600010"
            emissiveIntensity={0.4}
          />
        </mesh>
        {/* ポスター内の絵 */}
        <mesh position={CONTACT_POSTER_POSITION}>
          <planeGeometry args={CONTACT_POSTER_ARGS} />
          <meshStandardMaterial color="#1a0010" emissive="#ff69b4" emissiveIntensity={0.5} />
        </mesh>
        <pointLight
          position={CONTACT_LIGHT_POSITION}
          intensity={0.3}
          color="#f472b6"
          distance={3}
        />
      </group>
    </InteractiveObject>
  );
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
  );
}
