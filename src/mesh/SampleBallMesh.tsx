import { useTexture } from "@react-three/drei";
import { useEffect } from "react";
import { SRGBColorSpace } from "three";

function SampleBallMesh() {
  const [mapTexture, metalnessMapTexture] = useTexture([
    "textures/planets/earth_atmos_2048.jpg",
    "textures/planets/earth_specular_2048.jpg",
  ]);

  useEffect(() => {
    [mapTexture, metalnessMapTexture].forEach((texture) => {
      texture.anisotropy = 4;
      texture.colorSpace = SRGBColorSpace;
    });
  }, [mapTexture, metalnessMapTexture]);
  return (
    <mesh castShadow position={[1, 0.25, 1]} rotation={[0, Math.PI, 0]}>
      <sphereGeometry args={[0.25, 32, 32]} />
      <meshStandardMaterial
        color={0xffffff}
        roughness={0.5}
        metalness={1.0}
        map={mapTexture}
        metalnessMap={metalnessMapTexture}
      />
    </mesh>
  );
}

export default SampleBallMesh;
