import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

// 创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 3);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);

// 创建自定义shader材质
const shaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(0xff0000) },
    uFrequency: { value: 10.0 },
    uAmplitude: { value: 0.5 },
  },
  vertexShader,
  fragmentShader,
  side: THREE.DoubleSide,
});

// 创建平面几何体
const geometry = new THREE.PlaneGeometry(2, 2, 32, 32);
const plane = new THREE.Mesh(geometry, shaderMaterial);
scene.add(plane);

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  shaderMaterial.uniforms.uTime.value = performance.now() * 0.001;
  controls.update();
  renderer.render(scene, camera);
}

// 处理窗口缩放
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
