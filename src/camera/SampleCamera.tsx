import { PerspectiveCamera } from "@react-three/drei";

function SampleCamera() {
  return (
    <PerspectiveCamera
      makeDefault
      fov={50}
      aspect={window.innerWidth / window.innerHeight}
      near={0.01}
      far={100}
      position={[-4, 2, 4]}
    />
  );
}

export default SampleCamera;
