import { useTexture } from "@react-three/drei";
import { MeshProps } from "@react-three/fiber";
import { useMemo } from "react";
import { RepeatWrapping, SRGBColorSpace } from "three";

function SampleBoxMesh(props: MeshProps) {
  const [mapTexture, bumpMapTexture] = useTexture([
    "textures/brick_diffuse.jpg",
    "textures/brick_bump.jpg",
  ]);
  
  useMemo(() => {
    [mapTexture, bumpMapTexture].forEach((texture) => {
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.anisotropy = 4;
      texture.repeat.set(1, 1);
    });
    mapTexture.colorSpace = SRGBColorSpace;
  }, [bumpMapTexture, mapTexture]);
  return (
    <mesh castShadow {...props}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={0xffffff}
        roughness={0.7}
        bumpScale={1}
        metalness={0.2}
        map={mapTexture}
        bumpMap={bumpMapTexture}
      />
    </mesh>
  );
}

export default SampleBoxMesh;
