import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { PointLight } from "three";

function SampleBulbLight() {
  const ref = useRef<PointLight>(null);
  useFrame(() => {
    if (!ref.current) {
      return;
    }
    const time = Date.now() * 0.0005;
    ref.current.position.y = Math.cos(time) * 0.75 + 1.25;
  });
  return (
    <pointLight
      ref={ref}
      color={0xffee88}
      intensity={1}
      distance={100}
      decay={2}
      castShadow
      position={[0, 2, 0]}
    >
      <mesh>
        <sphereGeometry args={[0.2, 16, 8]} />
        <meshStandardMaterial
          color={0x000000}
          emissive={0xffffee}
          emissiveIntensity={1}
        />
      </mesh>
    </pointLight>
  );
}

export default SampleBulbLight;
