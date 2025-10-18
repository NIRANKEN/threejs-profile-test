import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import { RepeatWrapping, SRGBColorSpace } from "three";

function SampleFloorMesh() {
  const [mapTexture, bumpMapTexture, roughnessMapTexture] = useTexture([
    "textures/hardwood2_diffuse.jpg",
    "textures/hardwood2_bump.jpg",
    "textures/hardwood2_roughness.jpg",
  ]);

  useMemo(() => {
    [mapTexture, bumpMapTexture, roughnessMapTexture].forEach((texture) => {
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.anisotropy = 4;
      texture.repeat.set(10, 24);
    });
    mapTexture.colorSpace = SRGBColorSpace;
  }, [bumpMapTexture, mapTexture, roughnessMapTexture]);

  return (
    <mesh receiveShadow position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial
        roughness={0.8}
        color={0xffffff}
        metalness={0.2}
        bumpScale={1}
        map={mapTexture}
        bumpMap={bumpMapTexture}
        roughnessMap={roughnessMapTexture}
      />
    </mesh>
  );
}

export default SampleFloorMesh;
