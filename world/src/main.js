import * as THREE from "three";
import Vertex from "./shader/vertex.glsl";
import Fragment from "./shader/fragment.glsl";
import { OrbitControls } from "three/examples/jsm/Addons.js";

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = false;

// 增加底部网格
const gridHelper = new THREE.GridHelper(10, 10);
gridHelper.position.y = -1;
scene.add(gridHelper);

// 加载nosie纹理
const textureLoader = new THREE.TextureLoader();
textureLoader.load("/noise1.png", (texture) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  material.uniforms.uNoiseTexture.value = texture;
});

// 创建球体
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.ShaderMaterial({
  vertexShader: Vertex,
  fragmentShader: Fragment,
  uniforms: {
    uTickness: { value: 0.5 },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(0xff0000) }, // 红色
    uNoiseTexture: {
      value: null,
    },
  },
  transparent: true,
  blending: THREE.AdditiveBlending,
});

const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

const animate = function () {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
};

animate();
