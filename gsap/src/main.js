import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { gsap, TimelineMax } from "gsap";

// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// 创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
// 设置控制器阻尼，让控制器更有真实感
controls.enableDamping = true;

// 创建一个立方体
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 创建一个球体
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.x = 2; // 将球体放在立方体右侧
scene.add(sphere);

// 动画循环
function animate() {
  requestAnimationFrame(animate);

  // 更新控制器
  controls.update();

  renderer.render(scene, camera);
}
animate();

// 响应窗口调整
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// 使用 gsap 动画相机
// gsap.to(camera.position, { duration: 2, z: 10, ease: 'power1.inOut' });

// 使用GSAP让立方体旋转
// gsap.to(cube.rotation, { duration: 5, y: Math.PI * 2, ease: 'elastic.out' });

// 创建时间线
const tl = new TimelineMax({ repeat: -1, yoyo: true, repeatDelay: 0.5 });

// 添加更平滑的动画序列
tl.to(cube.position, { duration: 2, x: 2, ease: "power2.inOut" })
  .to(sphere.position, { duration: 2, y: 2, ease: "elastic.out(1, 0.3)" }, "-=1.5")
  .to(camera.position, { duration: 3, z: 8, ease: "power1.inOut" }, "-=1");
// 添加自动旋转
gsap.to(cube.rotation, { duration: 8, y: Math.PI * 2, epeat: -1, ease: "none" });
gsap.to(sphere.rotation, { duration: 6, x: Math.PI * 2, repeat: -1, ease: "none" });
