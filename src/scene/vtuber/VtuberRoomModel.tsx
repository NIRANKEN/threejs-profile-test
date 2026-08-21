import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import InteractiveObject from "../objects/InteractiveObject";
import { usePortfolioStore } from "../../store/usePortfolioStore";

const PORTRAIT_ASPECT = 513 / 763;
const PORTRAIT_HEIGHT = 1.1;
const PORTRAIT_WIDTH = PORTRAIT_HEIGHT * PORTRAIT_ASPECT;

const SCREEN_IMAGE_ASPECT = 3264 / 2448;
const SCREEN_IMAGE_HEIGHT = 2.2;
const SCREEN_IMAGE_WIDTH = SCREEN_IMAGE_HEIGHT * SCREEN_IMAGE_ASPECT;

type GLTFResult = GLTF & {
  nodes: {
    Object_4: THREE.Mesh;
    Object_6: THREE.Mesh;
    Object_8: THREE.Mesh;
    Object_10: THREE.Mesh;
    Object_12: THREE.Mesh;
    Object_14: THREE.Mesh;
    Object_16: THREE.Mesh;
  };
  materials: {
    Icelandic_Rock_tdpseesda: THREE.MeshStandardMaterial;
    "Emissive.001": THREE.MeshStandardMaterial;
    Material_0: THREE.MeshStandardMaterial;
    pillow: THREE.MeshStandardMaterial;
    "Skybox.001": THREE.MeshStandardMaterial;
    Sofa: THREE.MeshStandardMaterial;
    Structure: THREE.MeshStandardMaterial;
  };
};

export function VtuberRoomModel() {
  const { nodes, materials } = useGLTF(
    "/models/mountain_movie_lounge.glb",
  ) as unknown as GLTFResult;

  const setSceneMode = usePortfolioStore((s) => s.setSceneMode);

  const portraitTexture = useTexture("/images/minegishi_toppa_portfolio.png");
  portraitTexture.colorSpace = THREE.SRGBColorSpace;

  const screenTexture = useTexture("/images/mountain_image_asahidake.png");
  screenTexture.colorSpace = THREE.SRGBColorSpace;

  return (
    <group dispose={null}>
      {/* ── 背景・外景・空（Skybox / Icelandic Rock）── */}
      <mesh
        geometry={nodes.Object_12.geometry}
        material={materials["Skybox.001"]}
        scale={0.048}
        position={[0, -8.36, 0]}
      />
      <mesh
        geometry={nodes.Object_4.geometry}
        material={materials.Icelandic_Rock_tdpseesda}
        position={[0, -17.1, 1.69]}
        scale={[0.125, 0.125, 0.125]}
      />

      {/* ── ラウンジ構造体（壁・天井・床・ガラス）── */}
      <mesh
        geometry={nodes.Object_16.geometry}
        material={materials.Structure}
        position={[0, 0.15, -0.07]}
        receiveShadow
        castShadow
      />

      {/* ── ペンダントランプ ── */}
      <group position={[-0.02, 3.37, -0.75]} scale={0.001}>
        <mesh geometry={nodes.Object_6.geometry} material={materials["Emissive.001"]} />
        <mesh geometry={nodes.Object_8.geometry} material={materials.Material_0} />
      </group>

      {/* ── ソファ & クッション（クリック無反応・装飾のみ）── */}
      <group>
        <mesh
          geometry={nodes.Object_14.geometry}
          material={materials.Sofa}
          position={[0, 0, -1.38]}
          castShadow
          receiveShadow
        />
        <mesh
          geometry={nodes.Object_10.geometry}
          material={materials.pillow}
          position={[-0.01, 0.5, -0.07]}
          castShadow
        />
      </group>

      {/* ── Profile: ソファに立てかけたプロフィール看板 ── */}
      <InteractiveObject sectionId="profile" highlightColor={0xff9944}>
        <mesh
          position={[1.1, 0.5 + PORTRAIT_HEIGHT / 2, -0.25]}
          rotation={[0, (5 * Math.PI) / 4, 0]}
        >
          <planeGeometry args={[PORTRAIT_WIDTH, PORTRAIT_HEIGHT]} />
          <meshBasicMaterial
            map={portraitTexture}
            transparent
            alphaTest={0.5}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      </InteractiveObject>

      {/* ── Works: 正面ムービースクリーン・シアター壁（装飾のみ・クリック無反応） ── */}
      <group position={[0, 1.8, -5.95]}>
        {/* スクリーンフレーム & ディスプレイ */}
        <mesh>
          <planeGeometry args={[4.2, 2.4]} />
          <meshStandardMaterial
            color="#0d1b2a"
            emissive="#1e3a8a"
            emissiveIntensity={0.3}
            roughness={0.2}
          />
        </mesh>
        {/* スクリーン上部バッジ */}
        <mesh position={[0, 1.35, 0.02]}>
          <planeGeometry args={[1.6, 0.25]} />
          <meshStandardMaterial color="#3b82f6" emissive="#60a5fa" emissiveIntensity={0.6} />
        </mesh>
        {/* スクリーン映像（旭岳の写真）── クリックするとWorksを表示 */}
        <InteractiveObject sectionId="works" highlightColor={0x66aaff}>
          <mesh position={[0, 0, 0.9]}>
            <planeGeometry args={[SCREEN_IMAGE_WIDTH, SCREEN_IMAGE_HEIGHT]} />
            <meshBasicMaterial map={screenTexture} toneMapped={false} />
          </mesh>
        </InteractiveObject>
      </group>

      {/* ── Guidelines: ラウンジサイドテーブル / 配信規約ガイド ── */}
      <InteractiveObject sectionId="guidelines" highlightColor={0x34d399}>
        <group position={[2.6, 0.7, -1.4]} rotation={[0, -0.5, 0]}>
          {/* ガイドブック / スタンド */}
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.08, 0.45]} />
            <meshStandardMaterial color="#065f46" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.06, 0]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[0.5, 0.02, 0.35]} />
            <meshStandardMaterial color="#f0fdf4" roughness={0.8} />
          </mesh>
        </group>
      </InteractiveObject>

      {/* ── Links: ランタン & リンクラック ── */}
      <InteractiveObject sectionId="links" highlightColor={0xa78bfa}>
        <group position={[-2.6, 1.0, -1.4]} rotation={[0, 0.5, 0]}>
          {/* ランタンベース */}
          <mesh castShadow>
            <cylinderGeometry args={[0.15, 0.2, 0.5, 16]} />
            <meshStandardMaterial color="#312e81" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* ランタン発光部 */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.25, 16]} />
            <meshStandardMaterial color="#c084fc" emissive="#a855f7" emissiveIntensity={1.5} />
          </mesh>
        </group>
      </InteractiveObject>

      {/* ── REAL部屋へのポータル（出入口エリア）── */}
      <InteractiveObject onClick={() => setSceneMode("real")} highlightColor={0x38bdf8}>
        <group position={[0, 2.5, 1.7]} rotation={[0, Math.PI, 0]}>
          {/* ポータルゲート / ドアサイン */}
          <mesh>
            <boxGeometry args={[1.0, 0.6, 0.05]} />
            <meshStandardMaterial color="#0284c7" transparent opacity={0.35} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.15, 0.04]}>
            <planeGeometry args={[0.7, 0.15]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.8} />
          </mesh>
        </group>
      </InteractiveObject>
    </group>
  );
}

useGLTF.preload("/models/mountain_movie_lounge.glb");
useTexture.preload("/images/minegishi_toppa_portfolio.png");
useTexture.preload("/images/mountain_image_asahidake.png");
