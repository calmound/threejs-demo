import * as THREE from 'three';
import './style.css';

function initScene() {
  // 1. 创建场景、相机、渲染器
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60, // FOV: 视场角度
    window.innerWidth / window.innerHeight, // 宽高比
    0.1, // 近截面
    1000 // 远截面
  );
  camera.position.set(0, 0, 20); // 将相机放在稍微高一点，往后一点的位置

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // 2. 添加一个基础光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);

  // 3. 创建一些简单对象，用以模拟建筑和树木
  const geometryHouse = new THREE.BoxGeometry(4, 4, 4);
  const materialHouse = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const house = new THREE.Mesh(geometryHouse, materialHouse);
  house.position.set(0, 2, 0); // 让房子底部对准地面

  const geometryTree = new THREE.CylinderGeometry(0.5, 0.5, 3, 8);
  const materialTree = new THREE.MeshStandardMaterial({ color: 0x006400 });
  const tree = new THREE.Mesh(geometryTree, materialTree);
  tree.position.set(-3, 1.5, 3);

  // 4. 创建 Group，并将这些对象加入其中
  const group = new THREE.Group();
  group.add(house);
  group.add(tree);

  // 将 group 整体放置在场景中心偏左的区域
  group.position.set(-5, 0, 0);

  // 5. 添加到场景
  scene.add(group);

  // 6. 动画循环
  function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
  }

  animate();
}

initScene();
