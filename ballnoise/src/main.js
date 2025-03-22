// 导入必要的Three.js库和组件
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import { FileLoader } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// 创建WebGL渲染器，启用抗锯齿效果
const renderer = new THREE.WebGLRenderer({ antialias: true });
// 设置渲染器尺寸为窗口大小
renderer.setSize(window.innerWidth, window.innerHeight);
// 将渲染器的DOM元素添加到页面body中
document.body.appendChild(renderer.domElement);

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

// 设置相机位置
camera.position.set(0, -2, 14);
// 设置相机朝向场景中心
camera.lookAt(0, 0, 0);

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
    );
  });
}

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
  }
}

// 调用初始化着色器函数
initShaders();

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
  }
}

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
function animate() {
  // 更新时间变量
  uniforms.u_time.value = clock.getElapsedTime();
  // 更新频率变量，根据音频分析器获取的平均频率
  uniforms.u_frequency.value = analyser.getAverageFrequency();
  // 使用效果合成器渲染场景
  bloomComposer.render();
  // 请求下一帧动画
  requestAnimationFrame(animate);
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
