import * as THREE from "three";
import { Water } from "three/examples/jsm/objects/Water.js";

// 1. 创建一个场景
const scene = new THREE.Scene();

// 2. 创建相机
const camera = new THREE.PerspectiveCamera(
  75, // 视野(FOV)
  window.innerWidth / window.innerHeight, // 宽高比
  0.1, // 近截面
  1000 // 远截面
);
camera.position.set(0, 10, 30);

// 3. 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 4. 添加环境光和平行光
const ambientLight = new THREE.AmbientLight(0xffffff, 1110.5); // 添加环境光
scene.add(ambientLight);

const light = new THREE.DirectionalLight(0xffffff, 1222.5); // 增加平行光强度
light.position.set(0, 100, 50); // 调整光源位置
scene.add(light);

// 5. 加载水面法线贴图（此处仅作演示，需替换为你自己的纹理路径）
const textureLoader = new THREE.TextureLoader();
const waterNormals = textureLoader.load("/waternormals.jpg", function (texture) {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; // 让法线贴图可以重复
});

// 6. 创建水面
const waterGeometry = new THREE.PlaneGeometry(100, 100);

// 7. 使用 Water 类
const water = new Water(waterGeometry, {
  textureWidth: 512, // 生成的反射/折射纹理宽度
  textureHeight: 512, // 生成的反射/折射纹理高度
  waterNormals: waterNormals, // 法线贴图
  alpha: 1.0, // 水面的透明度
  sunDirection: light.position.clone().normalize(), // 模拟光线方向
  sunColor: 0xffffff, // “太阳光”颜色
  waterColor: 0x001e0f, // 水体颜色
  distortionScale: 3.7, // 失真程度，决定波纹起伏的大小
  fog: scene.fog !== undefined, // 是否结合场景雾效
});

water.rotation.x = -Math.PI / 2; // 让水面水平
scene.add(water);

// 8. 动画循环
function animate() {
  requestAnimationFrame(animate);

  // 让水面波纹动起来，内部水面材质会根据 time 进行偏移
  water.material.uniforms["time"].value += 0.01;

  renderer.render(scene, camera);
}
animate();
