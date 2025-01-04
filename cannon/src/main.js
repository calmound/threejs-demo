// 引入必要库
import * as THREE from "three";
import * as CANNON from "cannon";

// 初始化物理世界
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// 创建物理材质
const groundMaterial = new CANNON.Material('ground');
const sphereMaterial = new CANNON.Material('sphere');

// 创建接触材质
const contactMaterial = new CANNON.ContactMaterial(
  groundMaterial,
  sphereMaterial,
  {
    restitution: 0.7, // 反弹系数
    friction: 0.3     // 摩擦系数
  }
);
world.addContactMaterial(contactMaterial);

// 创建地面刚体
const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({
  mass: 0,
  shape: groundShape,
  material: groundMaterial  // 应用物理材质
});
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(groundBody);

// 创建球体刚体
const sphereShape = new CANNON.Sphere(1);
const sphereBody = new CANNON.Body({
  mass: 1,
  shape: sphereShape,
  material: sphereMaterial  // 应用物理材质
});
sphereBody.position.set(0, 10, 0);
world.addBody(sphereBody);

// 初始化 Three.js 场景
const scene = new THREE.Scene();

// 添加光源
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// 创建地面网格
const groundGeometry = new THREE.PlaneGeometry(30, 30);
const groundMeshMaterial = new THREE.MeshStandardMaterial({
  color: 0x808080,
  side: THREE.DoubleSide
});
const groundMesh = new THREE.Mesh(groundGeometry, groundMeshMaterial);
groundMesh.rotation.x = -Math.PI / 2;
scene.add(groundMesh);

// 创建球体网格
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sphereMeshMaterial = new THREE.MeshStandardMaterial({ color: 0x3498db });
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMeshMaterial);
scene.add(sphereMesh);

// 创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 时间步长
const timeStep = 1 / 60;

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  world.step(timeStep);
  sphereMesh.position.copy(sphereBody.position);
  sphereMesh.quaternion.copy(sphereBody.quaternion);
  renderer.render(scene, camera);
}

// 初始化摄像机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 15);
camera.lookAt(0, 0, 0);
scene.add(camera);

animate();