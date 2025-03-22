import { EffectComposer, RenderPass } from "postprocessing";
import * as THREE from "three";
import { GodraysPass } from "three-good-godrays";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// 初始化场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000511);

// 创建相机
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  3000
);
camera.position.set(0, 0, 200);

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 50;
controls.maxDistance = 500;

// 添加窗口大小调整事件监听
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// 创建一个简单的棋盘网格
const createChessboard = () => {
  const boardSize = 100;
  const gridSize = 8;
  const squareSize = boardSize / gridSize;

  const boardGeometry = new THREE.PlaneGeometry(
    boardSize,
    boardSize,
    gridSize,
    gridSize
  );
  const boardMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    roughness: 0.7,
    metalness: 0.1,
  });

  const board = new THREE.Mesh(boardGeometry, boardMaterial);
  board.rotation.x = -Math.PI / 2;
  board.position.y = -20;
  board.receiveShadow = true;
  scene.add(board);

  // 创建棋盘格子
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if ((i + j) % 2 === 1) {
        const squareGeometry = new THREE.BoxGeometry(squareSize, 2, squareSize);
        const squareMaterial = new THREE.MeshStandardMaterial({
          color: 0x333333,
          roughness: 0.8,
          metalness: 0.2,
        });
        const square = new THREE.Mesh(squareGeometry, squareMaterial);
        square.position.set(
          (i - gridSize / 2 + 0.5) * squareSize,
          -19,
          (j - gridSize / 2 + 0.5) * squareSize
        );
        square.castShadow = true;
        square.receiveShadow = true;
        scene.add(square);
      }
    }
  }
};

// 创建棋盘
createChessboard();

// 添加环境光
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// shadowmaps are needed for this effect
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = true;

// Make sure to set applicable objects in your scene to cast + receive shadows
// so that this effect will work
scene.traverse((obj) => {
  if (obj instanceof THREE.Mesh) {
    obj.castShadow = true;
    obj.receiveShadow = true;
  }
});

// godrays can be cast from either `PointLight`s or `DirectionalLight`s
const lightPos = new THREE.Vector3(0, 20, 0);
const pointLight = new THREE.PointLight(0xffffff, 1, 10000);
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.autoUpdate = true;
pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far = 1000;
pointLight.shadow.camera.updateProjectionMatrix();
pointLight.position.copy(lightPos);
scene.add(pointLight);

// 添加一个球体作为光源可视化
const lightSphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xffff00 })
);
lightSphere.position.copy(lightPos);
scene.add(lightSphere);

// set up rendering pipeline and add godrays pass at the end
const composer = new EffectComposer(renderer, {
  frameBufferType: THREE.HalfFloatType,
});

const renderPass = new RenderPass(scene, camera);
renderPass.renderToScreen = false;
composer.addPass(renderPass);

// Default values are shown.  You can supply a sparse object or `undefined`.
const params = {
  density: 1 / 128,
  maxDensity: 0.5,
  edgeStrength: 2,
  edgeRadius: 2,
  distanceAttenuation: 2,
  color: new THREE.Color(0xffffff),
  raymarchSteps: 60,
  blur: true,
  gammaCorrection: true,
};

const godraysPass = new GodraysPass(pointLight, camera, params);
// If this is the last pass in your pipeline, set `renderToScreen` to `true`
godraysPass.renderToScreen = true;
composer.addPass(godraysPass);

// 添加一些棋子作为示例
const addChessPieces = () => {
  // 创建白色棋子
  const whitePawnGeometry = new THREE.CylinderGeometry(4, 4, 8, 16);
  const whiteMaterial = new THREE.MeshStandardMaterial({
    color: 0xeeeeee,
    roughness: 0.5,
    metalness: 0.2,
  });

  // 创建黑色棋子
  const blackPawnGeometry = new THREE.CylinderGeometry(4, 4, 8, 16);
  const blackMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.5,
    metalness: 0.2,
  });

  // 放置一些棋子
  const boardSize = 100;
  const gridSize = 8;
  const squareSize = boardSize / gridSize;

  // 放置白色棋子
  for (let i = 0; i < 3; i++) {
    const whitePawn = new THREE.Mesh(whitePawnGeometry, whiteMaterial);
    whitePawn.position.set(
      (Math.random() * 4 - 2) * squareSize,
      -15,
      (Math.random() * 4 - 2) * squareSize
    );
    whitePawn.castShadow = true;
    whitePawn.receiveShadow = true;
    scene.add(whitePawn);
  }

  // 放置黑色棋子
  for (let i = 0; i < 3; i++) {
    const blackPawn = new THREE.Mesh(blackPawnGeometry, blackMaterial);
    blackPawn.position.set(
      (Math.random() * 4 + 1) * squareSize,
      -15,
      (Math.random() * 4 + 1) * squareSize
    );
    blackPawn.castShadow = true;
    blackPawn.receiveShadow = true;
    scene.add(blackPawn);
  }
};

// 添加棋子
addChessPieces();

// 动画循环
function animate() {
  requestAnimationFrame(animate);

  // 更新控制器
  controls.update();

  // 渲染场景
  composer.render();
}

// 开始动画循环
animate();
