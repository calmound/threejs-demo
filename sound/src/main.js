/**
 * 音频可视化效果展示
 * 主要功能：
 * - 使用 AudioLoader 加载音频文件
 * - 通过 Audio、AudioListener 实现音频播放控制
 * - 使用 AudioAnalyser 分析音频数据
 * - 射线拾取实现模型交互
 * - 后期处理实现辉光效果
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { generateRandomColor } from "./tools/util.js";
import fearlessAssets from "./assets/mp3/sound.mp3";

let canvasElement = null;
let containerElement = null;
const size = 64;
let raf = null;

/**
 * 创建后期处理效果合成器
 * @param {THREE.Scene} scene - 场景实例
 * @param {THREE.Camera} camera - 相机实例
 * @param {THREE.WebGLRenderer} renderer - 渲染器实例
 * @returns {EffectComposer} 效果合成器实例
 */
const createEffectComposer = (scene, camera, renderer) => {
  const bloomComposer = new EffectComposer(renderer);
  bloomComposer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.strength = 1;
  bloomPass.radius = 0.75;
  bloomPass.threshold = 0;
  bloomComposer.addPass(bloomPass);

  const outputPass = new OutputPass();
  bloomComposer.addPass(outputPass);

  return bloomComposer;
};

/**
 * 创建立方体模型组
 * @returns {THREE.Group} 包含多个立方体的组
 */
const createModels = () => {
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const targetCount = size / 2;
  const radius = 8;
  const angleStep = (2 * Math.PI) / targetCount;

  for (let i = 0; i < targetCount; i++) {
    const angle = angleStep * i;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);

    const material = new THREE.MeshPhongMaterial({
      color: generateRandomColor(),
      emissive: 0x444444,
      shininess: 100,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, 0, z);
    mesh.scale.set(0.5, 0.3, 0.5);
    mesh.rotation.y = -angle;
    // 添加初始属性用于动画
    mesh.userData.targetScale = 0.3;
    mesh.userData.currentScale = 0.3;
    group.add(mesh);
  }

  return group;
};

/**
 * 创建场景
 * @returns {THREE.Scene} 场景实例
 */
const createScene = () => {
  const scene = new THREE.Scene();

  // 添加环境光和平行光
  const ambientLight = new THREE.AmbientLight(0x404040);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(10, 10, 10);
  scene.add(ambientLight, directionalLight);

  // 添加粒子背景
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 2000;
  const positions = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 100;
  }

  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.1,
    color: 0xffffff,
  });
  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);

  return scene;
};

/**
 * 创建相机
 * @param {number} aspect - 相机宽高比
 * @returns {THREE.PerspectiveCamera} 透视相机实例
 */
const createCamera = (aspect) => {
  // 透视投影摄像机
  const camera = new THREE.PerspectiveCamera(45, aspect, 1, 1000);
  camera.position.set(16, 11, 12);
  // 设置摄像机方向
  camera.lookAt(0, 0, 0);
  return camera;
};

/**
 * 创建WebGL渲染器
 * @param {HTMLCanvasElement} canvasElement - canvas元素
 * @param {number} width - 渲染宽度
 * @param {number} height - 渲染高度
 * @returns {THREE.WebGLRenderer} WebGL渲染器实例
 */
const createWebGLRenderer = (canvasElement, width, height) => {
  const renderer = new THREE.WebGLRenderer({
    canvas: canvasElement,
    antialias: true,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  return renderer;
};

/**
 * 创建轨道控制器
 * @param {THREE.Camera} camera - 相机实例
 * @param {HTMLElement} domElement - DOM元素
 * @returns {OrbitControls} 轨道控制器实例
 */
const createControls = (camera, domElement) => {
  const controls = new OrbitControls(camera, domElement);
  controls.minDistance = 8;
  controls.maxDistance = 40;
  return controls;
};

/**
 * 应用射线拾取
 * @param {Object} params - 参数对象
 * @param {HTMLElement} params.containerElement - 容器元素
 * @param {THREE.Object3D[]} params.objects - 要检测的物体数组
 * @param {THREE.Camera} params.camera - 相机实例
 * @param {Function} params.callback - 点击回调函数
 * @returns {Function} 清理函数
 */
const applyRayCaster = (params) => {
  const { containerElement, objects, camera, callback } = params;
  const bounding = containerElement.getBoundingClientRect();
  // 射线拾取，点击任意模型实现音乐播放与暂停
  const rayCaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const handleClick = (event) => {
    pointer.x = ((event.clientX - bounding.left) / bounding.width) * 2 - 1;
    pointer.y = -((event.clientY - bounding.top) / bounding.height) * 2 + 1;

    rayCaster.setFromCamera(pointer, camera);
    // 计算物体和射线的焦点
    const intersects = rayCaster.intersectObjects(objects);
    if (intersects.length > 0) {
      callback && callback();
    }
  };
  containerElement.addEventListener("click", handleClick);
  return () => containerElement.removeEventListener("click", handleClick);
};

/**
 * 加载音频资源
 * @param {Function} onLoaded - 加载完成回调
 * @returns {Function} 清理函数
 */
const loadAssets = (onLoaded) => {
  let audio = null;
  let audioAnalyser = null;
  const audioLoader = new THREE.AudioLoader();
  const progressBar = document.querySelector(".progress-bar");
  let progressRAF = null;

  audioLoader.load(
    fearlessAssets,
    function (buffer) {
      const listener = new THREE.AudioListener();
      audio = new THREE.Audio(listener);
      audio.setBuffer(buffer);
      audio.setVolume(1);
      audio.setLoop(true);

      // 更新进度条的函数
      const updateProgress = () => {
        if (audio.isPlaying) {
          const currentTime = audio.context.currentTime - audio.startTime;
          const duration = audio.buffer.duration;
          const progress = (currentTime / duration) * 100;
          progressBar.value = progress;
        }
        progressRAF = requestAnimationFrame(updateProgress);
      };

      // 添加播放状态改变的监听
      audio.onEnded = () => (progressBar.value = 0);

      // 开始更新进度
      updateProgress();

      // 进度条拖动控制
      progressBar.addEventListener("input", (e) => {
        const time = (e.target.value / 100) * audio.buffer.duration;
        if (audio.isPlaying) {
          audio.stop();
          audio.play();
          audio.startTime = audio.context.currentTime - time;
        }
      });

      audioAnalyser = new THREE.AudioAnalyser(audio, size);
      onLoaded && onLoaded(audio, listener, audioAnalyser);
    },
    () => {},
    (err) => {
      console.log(err);
    }
  );

  return () => {
    if (audio && audio.isPlaying) {
      audio.stop();
    }
    if (progressRAF) {
      cancelAnimationFrame(progressRAF);
    }
  };
};

/**
 * 初始化应用
 * @returns {Function} 清理函数
 */
function init() {
  canvasElement = document.querySelector("#canvas");
  containerElement = document.querySelector("#container");
  const width = containerElement.clientWidth;
  const height = containerElement.clientHeight;
  let audioInstance, audioAnalyserInstance;
  let stopAudioPlay, removeClickEvent;

  const scene = createScene();
  const camera = createCamera(width / height);
  const renderer = createWebGLRenderer(canvasElement, width, height);
  const composer = createEffectComposer(scene, camera, renderer);
  const controls = createControls(camera, renderer.domElement);

  stopAudioPlay = loadAssets((audio, listener, audioAnalyser) => {
    audioInstance = audio;
    audioAnalyserInstance = audioAnalyser;
    camera.add(listener);
  });

  removeClickEvent = applyRayCaster({
    containerElement,
    objects: scene.children,
    camera,
    callback: () => {
      if (audioInstance) {
        audioInstance.isPlaying ? audioInstance.pause() : audioInstance.play();
      }
    },
  });

  // 创建模型
  const group = createModels();
  scene.add(group);

  // 动画循环
  function animate() {
    raf = requestAnimationFrame(animate);

    // 根据音频数据调整模型大小
    if (audioAnalyserInstance) {
      const data = audioAnalyserInstance.getFrequencyData();
      group.children.forEach((mesh, index) => {
        const value = data[index] / 255;
        mesh.userData.targetScale = 0.3 + value * 0.7;
        mesh.scale.y = THREE.MathUtils.lerp(
          mesh.scale.y,
          mesh.userData.targetScale,
          1.5
        );
      });
    }

    controls.update();
    composer.render();
  }

  animate();

  // 窗口大小变化事件
  window.addEventListener("resize", () => {
    const newWidth = containerElement.clientWidth;
    const newHeight = containerElement.clientHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
    composer.setSize(newWidth, newHeight);
  });

  // 返回清理函数
  return () => {
    window.removeEventListener("resize", () => {});
    removeClickEvent();
    stopAudioPlay();
    cancelAnimationFrame(raf);
  };
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", init);
