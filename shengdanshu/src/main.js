import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// 场景设置
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.getElementById("app").appendChild(renderer.domElement);

// 控制器设置
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 相机位置
camera.position.set(0, 5, 10);
controls.update();

// 添加环境光和方向光
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// 创建圣诞树
function createChristmasTree() {
  const treeGroup = new THREE.Group();

  // 树干 - 加长并调整形状
  const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2.5, 32);
  const trunkMaterial = new THREE.MeshPhongMaterial({
    color: 0x8b4513,
    shininess: 20,
  });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 1.25; // 调整树干位置
  treeGroup.add(trunk);

  // 树叶层 - 调整起始位置
  const levels = 5;
  for (let i = 0; i < levels; i++) {
    const radius = 3 - i * 0.5;
    const height = 1.2;
    const segments = 32;
    const coneGeometry = new THREE.ConeGeometry(radius, height, segments);
    const coneMaterial = new THREE.MeshPhongMaterial({
      color: 0x228b22,
      shininess: 30,
    });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.y = 2.5 + i * 1.1; // 提高树叶起始位置
    treeGroup.add(cone);
  }

  // 添加装饰球
  const decorationCount = 35; // 增加装饰球数量
  for (let i = 0; i < decorationCount; i++) {
    const size = 0.08 + Math.random() * 0.12; // 随机大小的装饰球
    const ballGeometry = new THREE.SphereGeometry(size, 32, 32);
    const ballMaterial = new THREE.MeshPhongMaterial({
      color: Math.random() < 0.7 ? Math.random() * 0xffffff : 0xffd700, // 70%概率是彩色，30%概率是金色
      shininess: 100,
      specular: 0x444444,
    });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);

    // 随机位置
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 2.2; // 增加分布范围
    const height = Math.random() * 4 + 2.5; // 调整高度范围

    ball.position.x = Math.cos(angle) * radius;
    ball.position.y = height;
    ball.position.z = Math.sin(angle) * radius;

    treeGroup.add(ball);
  }

  // 添加彩带
  const ribbonCount = 15;
  for (let i = 0; i < ribbonCount; i++) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2.5 + Math.random() * 3, 0),
      new THREE.Vector3(
        Math.random() * 2 - 1,
        2.5 + Math.random() * 3,
        Math.random() * 2 - 1
      ),
      new THREE.Vector3(
        Math.random() * 3 - 1.5,
        2.5 + Math.random() * 3,
        Math.random() * 3 - 1.5
      ),
    ]);

    const ribbonGeometry = new THREE.TubeGeometry(curve, 20, 0.02, 8, false);
    const ribbonMaterial = new THREE.MeshPhongMaterial({
      color: Math.random() * 0xff0000, // 随机红色系
      shininess: 80,
    });
    const ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
    treeGroup.add(ribbon);
  }

  // 添加礼物盒
  const giftCount = 6;
  for (let i = 0; i < giftCount; i++) {
    const giftGroup = new THREE.Group();

    // 礼物盒身
    const size = 0.4 + Math.random() * 0.3;
    const height = 0.4 + Math.random() * 0.3;
    const boxGeometry = new THREE.BoxGeometry(size, height, size);
    const boxMaterial = new THREE.MeshPhongMaterial({
      color: Math.random() * 0xffffff,
      shininess: 50,
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);

    // 礼物盒带
    const ribbonWidth = size * 0.1;
    const ribbonGeometry = new THREE.BoxGeometry(
      size,
      ribbonWidth,
      ribbonWidth
    );
    const ribbonMaterial = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      shininess: 80,
    });
    const ribbonH = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
    ribbonH.position.y = 0;

    const ribbonV = new THREE.Mesh(
      new THREE.BoxGeometry(ribbonWidth, ribbonWidth, size),
      ribbonMaterial
    );
    ribbonV.position.y = 0;

    giftGroup.add(box);
    giftGroup.add(ribbonH);
    giftGroup.add(ribbonV);

    // 随机位置
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.5 + Math.random() * 1;
    giftGroup.position.x = Math.cos(angle) * radius;
    giftGroup.position.y = height / 2;
    giftGroup.position.z = Math.sin(angle) * radius;
    giftGroup.rotation.y = Math.random() * Math.PI * 2;

    treeGroup.add(giftGroup);
  }

  // 添加星星
  const starGeometry = new THREE.OctahedronGeometry(0.3, 0);
  const starMaterial = new THREE.MeshPhongMaterial({
    color: 0xffd700,
    shininess: 100,
  });
  const star = new THREE.Mesh(starGeometry, starMaterial);
  star.position.y = 5.5;
  treeGroup.add(star);

  return treeGroup;
}

const christmasTree = createChristmasTree();
scene.add(christmasTree);

// 动画循环
function animate() {
  requestAnimationFrame(animate);

  // 旋转星星
  if (christmasTree.children[christmasTree.children.length - 1]) {
    christmasTree.children[
      christmasTree.children.length - 1
    ].rotation.y += 0.01;
  }

  controls.update();
  renderer.render(scene, camera);
}

// 窗口大小调整
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
