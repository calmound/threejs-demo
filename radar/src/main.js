import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// 场景基础设置
let scene, camera, renderer, controls;
let shaders = [];

// 初始化场景
function init() {
  // 创建场景
  scene = new THREE.Scene();

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  // 调整相机位置，以便更好地观察场景
  camera.position.set(100, 100, 100);
  camera.lookAt(0, 0, 0);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById("canvas").appendChild(renderer.domElement);

  // 创建控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // 添加窗口大小变化监听
  window.addEventListener("resize", onWindowResize, false);

  // 创建场景内容
  createScene();

  // 开始动画循环
  animate();
}

// 窗口大小变化处理
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// 创建场景内容
function createScene() {
  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0x404040, 2);
  scene.add(ambientLight);

  // 添加平行光（月光效果）
  const moonLight = new THREE.DirectionalLight(0x0066ff, 1);
  moonLight.position.set(50, 50, 50);
  moonLight.castShadow = true;
  moonLight.shadow.camera.top = 100;
  moonLight.shadow.camera.bottom = -100;
  moonLight.shadow.camera.left = -100;
  moonLight.shadow.camera.right = 100;
  moonLight.shadow.camera.near = 1;
  moonLight.shadow.camera.far = 200;
  moonLight.shadow.mapSize.set(1024, 1024);
  scene.add(moonLight);

  // 创建地面
  const groundGeometry = new THREE.PlaneGeometry(200, 200);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#0a0a0a"),
    side: THREE.DoubleSide,
    transparent: true,
    roughness: 0.8,
    metalness: 0.2,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI * 0.5;
  ground.receiveShadow = true;
  scene.add(ground);

  // 建筑物颜色
  const buildingColors = [
    new THREE.Color(0x4d6cfa), // 蓝色
    new THREE.Color(0x6c4dfa), // 紫色
    new THREE.Color(0x4dfac8), // 青色
    new THREE.Color(0x4d6cfa).multiplyScalar(0.5), // 暗蓝色
    new THREE.Color(0x6c4dfa).multiplyScalar(0.5), // 暗紫色
    new THREE.Color(0x4dfac8).multiplyScalar(0.5), // 暗青色
  ];

  // 生成建筑群
  const geometries = [];
  const helper = new THREE.Object3D();

  // 创建100个随机建筑
  for (let i = 0; i < 100; i++) {
    const width = Math.random() * 3 + 3;
    const height = Math.round(Math.random() * 15) + 5;
    const depth = Math.random() * 3 + 3;
    const color =
      buildingColors[Math.floor(Math.random() * buildingColors.length)];

    // 随机选择建筑类型
    let geometry;
    const buildingType = Math.floor(Math.random() * 4);

    switch (buildingType) {
      case 0: // 现代方形建筑
        geometry = createModernBuilding(width, height, depth, color);
        break;
      case 1: // 圆柱形塔楼
        geometry = createTower(width / 2, height, color);
        break;
      case 2: // 尖顶建筑
        geometry = createSpireBuilding(width, height, color);
        break;
      case 3: // 阶梯建筑
        geometry = createSteppedBuilding(width, height, color);
        break;
    }

    // 随机位置和旋转
    const x = Math.round(Math.random() * 80 - 40); // 修改分布范围
    const z = Math.round(Math.random() * 80 - 40); // 修改分布范围
    helper.position.set(x, 0, z);
    helper.rotation.y = Math.random() * Math.PI * 2; // 完整的旋转
    helper.updateMatrix();
    geometry.applyMatrix4(helper.matrix);

    geometries.push(geometry);
  }

  // 合并所有建筑几何体
  const mergedGeometry = mergeGeometries(geometries);
  const buildingMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.7,
    metalness: 0.3,
    transparent: true,
  });

  const cityMesh = new THREE.Mesh(mergedGeometry, buildingMaterial);
  cityMesh.castShadow = true;
  cityMesh.receiveShadow = true;
  scene.add(cityMesh);

  // 添加雷达扫描效果
  setupRadarEffect(buildingMaterial, groundMaterial);
}

// 创建现代方形建筑
function createModernBuilding(width, height, depth, color) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const count = geometry.attributes.position.count;
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    if (Math.random() > 0.85) {
      // 窗户效果
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 1.0;
      colors[i * 3 + 2] = 0.8;
    } else {
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
  }

  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

// 创建圆柱形塔楼
function createTower(radius, height, color) {
  const geometry = new THREE.CylinderGeometry(radius * 0.8, radius, height, 8);
  const count = geometry.attributes.position.count;
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const y = geometry.attributes.position.getY(i);
    const heightRatio = y / height;

    colors[i * 3] = color.r + heightRatio * 0.2;
    colors[i * 3 + 1] = color.g + heightRatio * 0.2;
    colors[i * 3 + 2] = color.b + heightRatio * 0.2;
  }

  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

// 创建尖顶建筑
function createSpireBuilding(width, height, color) {
  const baseHeight = height * 0.7;
  const topHeight = height * 0.3;

  const base = new THREE.BoxGeometry(width, baseHeight, width);
  base.translate(0, baseHeight / 2, 0);

  const top = new THREE.ConeGeometry(width / 2, topHeight, 4);
  top.rotateY(Math.PI / 4);
  top.translate(0, baseHeight + topHeight / 2, 0);

  const geometry = mergeGeometries([base, top]);
  const count = geometry.attributes.position.count;
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const y = geometry.attributes.position.getY(i);
    colors[i * 3] = color.r + (y > baseHeight ? 0.2 : 0);
    colors[i * 3 + 1] = color.g + (y > baseHeight ? 0.2 : 0);
    colors[i * 3 + 2] = color.b + (y > baseHeight ? 0.2 : 0);
  }

  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

// 创建阶梯建筑
function createSteppedBuilding(width, height, color) {
  const segments = Math.floor(Math.random() * 3) + 2;
  const geometries = [];

  let currentHeight = 0;
  let currentWidth = width;
  const segmentHeight = height / segments;

  for (let i = 0; i < segments; i++) {
    const box = new THREE.BoxGeometry(
      currentWidth,
      segmentHeight,
      currentWidth
    );
    box.translate(0, currentHeight + segmentHeight / 2, 0);
    geometries.push(box);

    currentHeight += segmentHeight;
    currentWidth *= 0.8;
  }

  const geometry = mergeGeometries(geometries);
  const count = geometry.attributes.position.count;
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const y = geometry.attributes.position.getY(i);
    const heightRatio = y / height;
    colors[i * 3] = color.r + heightRatio * 0.3;
    colors[i * 3 + 1] = color.g + heightRatio * 0.3;
    colors[i * 3 + 2] = color.b + heightRatio * 0.3;
  }

  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

// 设置雷达扫描效果
function setupRadarEffect(buildingMaterial, groundMaterial) {
  // 创建自定义着色器材质
  const radarMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uSize: { value: 100.0 },
      uTime: { value: 0.0 },
      uColor: { value: new THREE.Color("#00FFFF") },
    },
    vertexShader: `
      varying vec2 vUv;
      
      void main() {
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;
        gl_Position = projectedPosition;
        
        vUv = position.xz / 100.0;
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec3 uColor;
      
      void main() {
        float d = length(vUv);
        vec3 finalColor = vec3(0.0);
        
        if(d >= uTime && d <= uTime + 0.1) {
          float intensity = 1.0 - (d - uTime) * 10.0;
          finalColor = uColor * intensity;
        }
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
  });

  // 创建雷达平面
  const radarGeometry = new THREE.PlaneGeometry(200, 200);
  const radar = new THREE.Mesh(radarGeometry, radarMaterial);
  radar.rotation.x = -Math.PI * 0.5;
  radar.position.y = 0.1; // 稍微抬高一点，避免与地面重叠
  scene.add(radar);

  // 更新动画函数
  const updateRadar = () => {
    radarMaterial.uniforms.uTime.value += 0.003;
    if (radarMaterial.uniforms.uTime.value >= 1) {
      radarMaterial.uniforms.uTime.value = 0;
    }
  };

  // 将更新函数添加到动画循环中
  shaders.push({ update: updateRadar });
}

// 动画循环
function animate() {
  requestAnimationFrame(animate);

  // 更新控制器
  controls.update();

  // 更新雷达扫描效果
  if (shaders.length) {
    shaders.forEach((shader) => {
      if (shader.update) {
        shader.update();
      }
    });
  }

  // 渲染场景
  renderer.render(scene, camera);
}

// 初始化场景
init();
