// 导入必要的Three.js库和组件
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import { FileLoader } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
<<<<<<< Updated upstream
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// 场景基础设置
let scene, camera, renderer, controls;
let shaders = [];
=======

// 创建WebGL渲染器，启用抗锯齿效果
const renderer = new THREE.WebGLRenderer({ antialias: true });
// 设置渲染器尺寸为窗口大小
renderer.setSize(window.innerWidth, window.innerHeight);
// 将渲染器的DOM元素添加到页面body中
document.body.appendChild(renderer.domElement);
>>>>>>> Stashed changes

// 创建场景对象，用于存放所有3D对象
const scene = new THREE.Scene();
// 创建透视相机，参数分别是：视场角度、宽高比、近裁剪面、远裁剪面
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// 设置渲染器的颜色空间为sRGB，确保颜色正确显示
renderer.outputColorSpace = THREE.SRGBColorSpace;

// 创建渲染通道，用于后期处理
const renderScene = new RenderPass(scene, camera);

// 创建辉光通道，为场景添加发光效果
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight)
);
// 设置辉光阈值，只有亮度超过此值的像素才会发光
bloomPass.threshold = 0.5;
// 设置辉光强度
bloomPass.strength = 0.5;
// 设置辉光半径
bloomPass.radius = 0.4;

<<<<<<< Updated upstream
  // 创建场景内容
  createScene();
=======
// 创建效果合成器，用于组合多个后期处理效果
const bloomComposer = new EffectComposer(renderer);
// 添加渲染通道
bloomComposer.addPass(renderScene);
// 添加辉光通道
bloomComposer.addPass(bloomPass);

// 创建输出通道，用于最终渲染结果的输出
const outputPass = new OutputPass();
// 添加输出通道到合成器
bloomComposer.addPass(outputPass);
>>>>>>> Stashed changes

// 设置相机位置
camera.position.set(0, -2, 14);
// 设置相机朝向场景中心
camera.lookAt(0, 0, 0);

<<<<<<< Updated upstream
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
=======
// 定义着色器的统一变量（uniforms），用于在着色器程序中传递数据
const uniforms = {
  u_time: { type: "f", value: 0.0 }, // 时间变量，用于动画
  u_frequency: { type: "f", value: 0.0 }, // 频率变量，用于音频可视化
  u_red: { type: "f", value: 0.3 }, // 红色分量
  u_green: { type: "f", value: 1 }, // 绿色分量
  u_blue: { type: "f", value: 0.6 }, // 蓝色分量
};

/**
 * 加载着色器文件
 * @param {string} path - 着色器文件路径
 * @returns {Promise<string>} - 返回包含着色器代码的Promise
 */
function loadShader(path) {
  return new Promise((resolve, reject) => {
    const loader = new FileLoader();
    loader.load(
      path,
      (data) => {
        resolve(data);
      },
      undefined,
      (err) => {
        console.error(`加载着色器文件 ${path} 失败:`, err);
        reject(err);
      }
>>>>>>> Stashed changes
    );
  });
}

<<<<<<< Updated upstream
    currentHeight += segmentHeight;
    currentWidth *= 0.8;
=======
/**
 * 初始化着色器并创建网格
 * 异步函数，用于加载顶点着色器和片元着色器，并创建3D网格
 */
async function initShaders() {
  try {
    // 加载顶点着色器和片元着色器
    const vertexShader = await loadShader("/shaders/vertex.glsl");
    const fragmentShader = await loadShader("/shaders/fragment.glsl");

    // 创建着色器材质
    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });

    // 创建二十面体几何体，用于雷达效果
    const geo = new THREE.IcosahedronGeometry(4, 30);
    // 创建网格并添加到场景
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    // 设置为线框模式，增强科幻效果
    mesh.material.wireframe = true;

    // 启动动画循环
    animate();
  } catch (error) {
    console.error("初始化着色器失败:", error);
>>>>>>> Stashed changes
  }
}

// 调用初始化着色器函数
initShaders();

<<<<<<< Updated upstream
  for (let i = 0; i < count; i++) {
    const y = geometry.attributes.position.getY(i);
    const heightRatio = y / height;
    colors[i * 3] = color.r + heightRatio * 0.3;
    colors[i * 3 + 1] = color.g + heightRatio * 0.3;
    colors[i * 3 + 2] = color.b + heightRatio * 0.3;
=======
// 创建音频监听器
const listener = new THREE.AudioListener();
// 将监听器添加到相机
camera.add(listener);

// 创建音频对象
const sound = new THREE.Audio(listener);

// 创建音频加载器
const audioLoader = new THREE.AudioLoader();

// 添加用户交互控制音频播放
let audioLoaded = false;
let audioBuffer = null;

// 加载音频文件
audioLoader.load("/Beats.mp3", function (buffer) {
  console.log("音频加载完成");
  audioBuffer = buffer;
  audioLoaded = true;
});

// 尝试播放音频的函数
function tryPlayAudio() {
  if (!audioLoaded) return;

  try {
    sound.setBuffer(audioBuffer);
    sound.setLoop(true);
    sound.play();
    console.log("音频开始播放");
  } catch (error) {
    console.error("音频播放失败:", error);
>>>>>>> Stashed changes
  }
}

<<<<<<< Updated upstream
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
=======
// 添加点击事件监听器，确保用户交互后播放音频
document.addEventListener("click", function () {
  if (audioLoaded && !sound.isPlaying) {
    console.log("start");
    tryPlayAudio();
  }
});

// 创建音频分析器，用于获取音频频率数据
const analyser = new THREE.AudioAnalyser(sound, 32);

// 创建时钟对象，用于跟踪时间
const clock = new THREE.Clock();

/**
 * 动画循环函数
 * 在每一帧更新uniforms变量，并渲染场景
 */
>>>>>>> Stashed changes
function animate() {
  // 更新时间变量
  uniforms.u_time.value = clock.getElapsedTime();
  // 更新频率变量，根据音频分析器获取的平均频率
  uniforms.u_frequency.value = analyser.getAverageFrequency();
  // 使用效果合成器渲染场景
  bloomComposer.render();
  // 请求下一帧动画
  requestAnimationFrame(animate);
<<<<<<< Updated upstream

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
=======
>>>>>>> Stashed changes
}

// 监听窗口大小变化事件，调整渲染尺寸
window.addEventListener("resize", function () {
  // 更新相机宽高比
  camera.aspect = window.innerWidth / window.innerHeight;
  // 更新相机投影矩阵
  camera.updateProjectionMatrix();
  // 更新渲染器尺寸
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 更新效果合成器尺寸
  bloomComposer.setSize(window.innerWidth, window.innerHeight);
});
