import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";

function SpinningBox() {
  const meshRef = useRef();

  // 每一帧旋转立方体
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

function Scene() {
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Canvas>
        {/* 添加光源 */}
        <directionalLight position={[10, 10, 5]} intensity={1} />
        {/* 添加一个旋转的立方体 */}
        <SpinningBox />
        {/* 添加相机控制 */}
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default Scene;
