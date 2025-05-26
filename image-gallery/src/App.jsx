import "./App.css";
import * as THREE from "three";
import { MeshReflectorMaterial, Image, OrbitControls } from "@react-three/drei";
import { Canvas, extend, useThree } from "@react-three/fiber";
import { useRef } from "react";

const GOLDENRATIO = 1.61803398875;

extend({ CameraHelper: THREE.CameraHelper });

function App({ images }) {
  return (
    <>
      <Canvas dpr={[1, 1.5]} camera={{ fov: 70, position: [0, 2, 15] }}>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.5}
        />
        <CameraHelper />
        <color attach="background" args={["#191920"]} />
        <fog attach="fog" args={["#191920", 0, 15]} />
        <group position={[0, -0.5, 0]}>
          <Frames images={images} />
          {/* 创建地面 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[50, 50]} />
            <MeshReflectorMaterial blur={[300, 300]} />
          </mesh>
        </group>
      </Canvas>
    </>
  );
}

const Frames = ({ images }) => {
  const ref = useRef();
  return (
    <group ref={ref} onClick={() => {}}>
      {images.map((props) => (
        <Frame key={props.url} {...props} />
      ))}
    </group>
  );
};

const Frame = ({ url }) => {
  const name = Math.random().toString(36).substring(7);
  const ref = useRef();
  return (
    <group>
      <mesh name={name} scale={[1, GOLDENRATIO, 0.05]} position={[0, GOLDENRATIO / 2, 0]}>
        <boxGeometry />
        <meshStandardMaterial color="white" />

        <mesh>
          <boxGeometry />
          <meshStandardMaterial color="#151515" />
        </mesh>

        <Image url={url} position={[0, 0, 0.7]} raycast={() => null} />
      </mesh>
    </group>
  );
};

const CameraHelper = () => {
  const { scnene, camera } = useThree();
  const helper = useRef();
  return <cameraHelper ref={helper} args={[camera]} />;
};

export default App;
