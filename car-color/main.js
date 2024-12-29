import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let scene, camera, renderer, controls;
let car;

function init() {
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(2, 2, 2);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // 添加灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // 添加控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // 加载汽车模型
  const loader = new GLTFLoader();
  loader.load(
    "free_merc_hovercar/scene.gltf",
    function (gltf) {
      console.log("gltf", gltf);
      car = gltf.scene;
      car.scale.set(1, 1, 1);
      car.position.set(0, 0, 0);
      scene.add(car);

      // 处理所有材质，移除阴影
      car.traverse((child) => {
        if (child.isMesh) {
          // 存储原始材质
          child.originalMaterial = child.material.clone();

          // 创建新的材质，禁用所有阴影相关属性
          const newMaterial = new THREE.MeshPhongMaterial({
            color: child.material.color,
            transparent: child.material.transparent,
            opacity: child.material.opacity,
            map: child.material.map,
            side: THREE.DoubleSide,
            depthWrite: true,
            depthTest: true,
            shadowSide: THREE.NoShadow,
          });

          // 如果是玻璃材质，保持透明
          if (child.name.toLowerCase().includes("glass")) {
            newMaterial.transparent = true;
            newMaterial.opacity = 0.3;
          }

          // 应用新材质
          child.material = newMaterial;
          child.castShadow = false;
          child.receiveShadow = false;
        }
      });
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    function (error) {
      console.error("An error happened:", error);
    }
  );

  // 添加事件监听器
  window.addEventListener("resize", onWindowResize, false);
  setupControls();
}

function setupControls() {
  // 颜色选择器
  document.getElementById("carColor").addEventListener("input", function (e) {
    if (!car) return;
    const color = new THREE.Color(e.target.value);
    car.traverse((child) => {
      if (child.isMesh) {
        // 不改变玻璃的颜色
        if (!child.name.toLowerCase().includes("glass")) {
          // 创建新的材质
          const newMaterial = new THREE.MeshPhongMaterial({
            color: color,
            transparent: child.material.transparent,
            opacity: child.material.opacity,
            map: child.material.map,
            side: THREE.DoubleSide,
            depthWrite: true,
            depthTest: true,
            shadowSide: THREE.NoShadow,
          });
          child.material = newMaterial;
        }
      }
    });
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// 启动应用程序
init();
animate();
