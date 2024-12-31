// ====================== 基础依赖导入 ======================
// 导入Three.js核心模块
import * as THREE from "three";
// 导入轨道控制器 - 用于控制场景视角
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// 导入字体加载器 - 用于加载3D文字字体
import { FontLoader } from "three/addons/loaders/FontLoader.js";
// 导入文字几何体 - 用于创建3D文字
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

// ====================== 后处理和特效相关导入 ======================
import {
  Scene, // 场景
  FileLoader, // 文件加载器
  ShaderMaterial, // 着色器材质
  ExtrudeGeometry, // 挤压几何体
  BufferAttribute, // 缓冲属性
  PointsMaterial, // 点材质
  WebGLRenderer, // WebGL渲染器
  Vector2, // 二维向量
  WebGLRenderTarget, // WebGL渲染目标
  BufferGeometry, // 缓冲几何体
  Color, // 颜色
  AmbientLight, // 环境光
  DirectionalLight, // 平行光
  Group, // 组
  OBJLoader, // OBJ模型加载器
  MeshPhongMaterial, // Phong材质
  Points, // 点
  Mesh, // 网格
  ShaderPass, // 着色器通道
  UnrealBloomPass, // 泛光通道
  GammaCorrectionShader, // 伽马校正着色器
} from "./UnrealBloomPass.1735305046112.js";

// ====================== 工具和API导入 ======================
// 导入OBJ加载器和ZIP处理工具
import { OBJLoader as OBJLoader2, JSZip } from "./jszip.min.1735305046112.js";
// 导入空间ID和告白数据获取API
import { getSpaceId, getConfessionData } from "./api.1735305046112.js";
// 导入Vue相关功能
import {
  defineComponent,
  ref,
  onMounted,
  h,
  createApp,
} from "./index.1735305046112.js";

// ====================== 场景初始化 ======================
// 创建Three.js场景
const scene = new THREE.Scene();
// 设置场景背景为黑色
scene.background = new THREE.Color(0x000000);

// ====================== 相机设置 ======================
// 创建透视相机：视场角75度，屏幕宽高比，近裁剪面0.1，远裁剪面1000
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
// 设置相机位置
camera.position.set(-1.77, -1.042, 5.65);

// ====================== 渲染器设置 ======================
// 创建WebGL渲染器
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
  antialias: true, // 开启抗锯齿
  alpha: true, // 开启透明
});
// 设置渲染器尺寸为窗口大小
renderer.setSize(window.innerWidth, window.innerHeight);
// 设置渲染器清除颜色为透明
renderer.setClearColor(0x000000, 0);

// ====================== WebGL上下文设置 ======================
// 获取WebGL上下文
const context = renderer.getContext();
let maxSamples = 4;
// 检查是否支持WebGL2并设置最大采样数
if (
  typeof WebGL2RenderingContext !== "undefined" &&
  context instanceof WebGL2RenderingContext
) {
  maxSamples = context.getParameter(context.MAX_SAMPLES);
  console.log("支持的最大采样数:", maxSamples);
} else {
  console.log("当前环境不支持WebGL2");
}

// ====================== 渲染缓冲设置 ======================
// 获取渲染缓冲大小
const bufferSize = renderer.getDrawingBufferSize(new THREE.Vector2());
const renderScale = 2; // 渲染比例
// 创建具有多重采样的渲染目标
const renderTarget = new THREE.WebGLRenderTarget(
  bufferSize.width * renderScale,
  bufferSize.height * renderScale,
  {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    samples: maxSamples || 16, // 使用最大采样数或默认16
  }
);

// ====================== 表白文字数组 ======================
// 定义可用的表白文字
const confessions = [
  "你是我生命里的阳光",
  "遇见你是我最大的幸运",
  "每一天因为有你而变得特别",
  "你的笑容是我最爱的风景",
  "想和你一起数星星看月亮",
  "你是我心中最美的风景",
  "愿意为你写下最动人的诗句",
  "和你在一起的每一刻都很珍贵",
  "你就是我的整个世界",
  "想要和你一起走过春夏秋冬",
];

// ====================== 粒子系统创建 ======================
/**
 * 创建粒子系统的几何体
 * @returns {THREE.BufferGeometry} 返回粒子系统的几何体
 */
function createParticleSystem() {
  const geometry = new THREE.BufferGeometry();
  const particleCount = 100; // 粒子总数
  const positions = new Float32Array(particleCount * 3); // 每个粒子需要x,y,z三个坐标

  // 随机生成每个粒子的的位置
  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 8; // X坐标：-4到4之间
    positions[i + 1] = Math.random() * 8.2; // Y坐标：0到8.2之间
    positions[i + 2] = (Math.random() - 0.5) * 12; // Z坐标：-6到6之间
  }

  // 将位置数据添加到几何体中
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geometry;
}

// ====================== 纹理创建 ======================
/**
 * 创建渐变纹理
 * @param {string} type - 纹理类型：'red', 'white', 或 'yellow'
 * @returns {THREE.CanvasTexture} 返回创建的渐变纹理
 */
function createGradientTexture(type) {
  // 创建画布
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 16;
  const context = canvas.getContext("2d");

  // 创建径向渐变
  const gradient = context.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0, // 内圆中心点和半径
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2 // 外圆中心点和半径
  );

  // 根据类型设置不同的渐变颜色
  if (type === "red") {
    // 红色系渐变，用于主要粒子效果
    gradient.addColorStop(0, "rgba(255,255,255,0.1)");
    gradient.addColorStop(0.2, "rgba(255,182,193,0.1)");
    gradient.addColorStop(0.4, "rgba(64,0,0,0.1)");
    gradient.addColorStop(1, "rgba(0,0,0,0.1)");
  } else if (type === "white") {
    // 白色系渐变，用于高亮效果
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.2, "rgba(255,241,220,1)");
    gradient.addColorStop(0.4, "rgba(193,116,0,1)");
    gradient.addColorStop(1, "rgba(0,0,0,1)");
  } else if (type === "yellow") {
    // 黄色系渐变，用于装饰效果
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.2, "rgba(255,241,220,1)");
    gradient.addColorStop(0.4, "rgba(219,166,87,1)");
    gradient.addColorStop(1, "rgba(0,0,0,1)");
  }

  // 将渐变应用到画布
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 创建纹理并返回
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ====================== 粒子材质创建 ======================
// 创建粒子的材质
const particleMaterial = new THREE.PointsMaterial({
  size: 0.35, // 粒子大小
  color: createGradientTexture("red"), // 粒子颜色
  opacity: 1, // 不透明度
  map: createGradientTexture("red"), // 粒子纹理
  transparent: true, // 开启透明
  alphaMap: createGradientTexture("red"), // 透明度贴图
  alphaTest: 0.001, // 透明度测试阈值
  depthTest: false, // 关闭深度测试
  depthWrite: false, // 关闭深度写入
});

// 创建粒子系统并添加到场景
const particles = new THREE.Points(createParticleSystem(), particleMaterial);
scene.add(particles);

// ====================== 粒子动画 ======================
/**
 * 更新粒子系统的动画
 * 实现粒子的飘动和循环效果
 */
function animateParticles() {
  const positions = particles.geometry.getAttribute("position");
  const count = positions.count;
  const time = Date.now() * 0.00005; // 用于创建周期性运动

  // 更新每个粒子的位置
  for (let i = 0; i < count; i++) {
    // 水平方向的正弦运动
    const xOffset = Math.sin(time + i) * 0.03;
    positions.setX(i, positions.getX(i) + xOffset);

    // 垂直方向的下落
    const ySpeed = 0.01 + Math.random() * 0.01;
    positions.setY(i, positions.getY(i) - ySpeed);

    // 当粒子落到底部时，重置到顶部
    if (positions.getY(i) < -3.5) {
      positions.setY(i, 3.5);
      positions.setX(i, (Math.random() - 0.5) * 10);
    }
  }
  positions.needsUpdate = true; // 标记位置需要更新
}

// ====================== 光照设置 ======================
// 添加环境光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // 白色环境光
scene.add(ambientLight);

// 添加点光源
const pointLight = new THREE.PointLight(0xffffff, 0.4); // 白色点光源
pointLight.position.set(0, 1, 0); // 设置光源位置
scene.add(pointLight);

// ====================== 相机控制器 ======================
// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // 启用阻尼效果
controls.dampingFactor = 0.05; // 设置阻尼系数
controls.rotateSpeed = 0.5; // 设置旋转速度
controls.maxPolarAngle = Math.PI * 0.6; // 限制垂直旋转角度
controls.minPolarAngle = Math.PI * 0.3; // 限制垂直旋转角度

// ====================== 主循环动画 ======================
/**
 * 主渲染循环
 * 负责更新场景中的所有动画效果
 */
function animate() {
  // 请求下一帧动画
  requestAnimationFrame(animate);

  // 更新控制器状态
  controls.update();

  // 更新粒子动画
  animateParticles();

  // 渲染场景
  renderer.render(scene, camera);
}

// ====================== 窗口响应式处理 ======================
// 监听窗口大小变化
window.addEventListener("resize", () => {
  // 更新相机宽高比
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  // 更新渲染器尺寸
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 开始动画循环
animate();

// ====================== 后处理着色器定义 ======================
/**
 * 伽马校正着色器
 * 用于调整渲染输出的颜色空间，使其更符合人眼感知
 */
const GammaCorrectionShader = {
  name: "GammaCorrectionShader",
  uniforms: {
    tDiffuse: { value: null }, // 输入纹理
  },
  // 顶点着色器
  vertexShader: `
    precision highp float;
    attribute vec3 position;
    attribute vec2 uv;
    varying vec2 vUv;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    void main() {
      vUv = uv;  // 传递纹理坐标到片段着色器
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // 片段着色器
  fragmentShader: `
    precision highp float;
    uniform sampler2D tDiffuse;
    varying vec2 vUv;

    // sRGB到线性空间的转换函数
    vec4 sRGBToLinear(vec4 value) {
      return vec4(mix(
        pow(value.rgb * 0.9478672986 + 0.0521327014, vec3(2.4)), 
        value.rgb * 0.0773993808, 
        vec3(lessThanEqual(value.rgb, vec3(0.04045)))
      ), value.a);
    }

    void main() {
      vec4 tex = texture2D(tDiffuse, vUv);
      gl_FragColor = sRGBToLinear(tex);  // 应用伽马校正
    }
  `,
};

// ====================== 资源路径定义 ======================
var symbolPath = "/assets/symbol_04.1735305046112.png"; // 符号纹理路径
const webglContainer = {
  id: "webgl", // WebGL容器ID
};

// ====================== Vue组件定义 ======================
/**
 * 表白场景Vue组件
 * 负责管理整个3D场景的生命周期和状态
 */
const loveComponent = {
  __name: "love",
  setup(props) {
    const router = useRouter();
    document.title = "深处礼物"; // 设置页面标题

    // 状态管理
    let spaceId = ref(""); // 空间ID
    let confessionList = JSON.parse(sessionStorage.getItem("confessionList")); // 表白文字列表

    // 组件挂载时的处理
    onMounted(() => {
      spaceId.value = getSpaceId("id3d");
      // 如果有表白列表则初始化场景，否则加载数据
      confessionList && confessionList.length
        ? initScene()
        : loadConfessionData();
    });

    /**
     * 加载表白数据
     * 从服务器获取表白文字列表
     */
    const loadConfessionData = () => {
      let params = {
        spaceNo: spaceId.value,
      };
      getConfessionData(params).then((response) => {
        if (response.code == 0) {
          // 保存数据到会话存储
          sessionStorage.setItem(
            "confessionList",
            JSON.stringify(response.data.confessionList)
          );
          confessionList = JSON.parse(sessionStorage.getItem("confessionList"));
          initScene(); // 初始化3D场景
        } else {
          router.push("/add?id3d=" + spaceId.value); // 跳转到添加页面
        }
      });
    };

    /**
     * 初始化3D场景
     * 创建并设置所有3D对象、材质、动画等
     */
    const initScene = () => {
      // 创建主场景和相机
      const mainScene = new Scene();
      const mainCamera = new PerspectiveCamera();
      mainCamera.position.set(-1.77, -1.042, 5.65);

      // 设置渲染器
      const mainRenderer = new WebGLRenderer({
        antialias: true, // 启用抗锯齿
      });
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      mainRenderer.setSize(windowWidth, windowHeight);

      // 添加渲染器到DOM
      var container = document.getElementById("webgl");
      container.appendChild(mainRenderer.domElement);

      // WebGL2支持检测
      const glContext = mainRenderer.getContext();
      let maxSampleCount = 4;
      if (typeof WebGL2RenderingContext == "undefined") {
        console.log("WebGL 2.0 is not supported in this browser.");
      } else if (glContext instanceof WebGL2RenderingContext) {
        maxSampleCount = glContext.getParameter(glContext.MAX_SAMPLES);
        console.log("Maximum samples supported:", maxSampleCount);
      } else {
        console.log("WebGL2 is not supported in this environment.");
      }

      // 设置渲染目标
      const bufferSize = mainRenderer.getDrawingBufferSize(new Vector2());
      let renderScale = 2;
      const renderTarget = new WebGLRenderTarget(
        bufferSize.width * renderScale,
        bufferSize.height * renderScale,
        {
          minFilter: LinearFilter,
          magFilter: LinearFilter,
          format: RGBAFormat,
          samples: maxSampleCount || 16,
        }
      );

      // 创建后期处理合成器
      const composer = new EffectComposer(mainRenderer, renderTarget);
      // 添加轨道控制器
      new OrbitControls(mainCamera, mainRenderer.domElement);

      // ===== 粒子系统创建 =====
      // ... (粒子系统相关代码保持不变) ...

      // ===== 心形模型创建 =====
      const heartGroup = new Group(); // 创建心形模型组
      mainScene.add(heartGroup);

      const objLoader = new OBJLoader();
      let hearts = []; // 存储所有心形模型
      const heartColors = [0xff8cab, 0xff8d8d]; // 心形模型的颜色数组

      // 添加场景光源
      const ambientLight = new AmbientLight(0xffffff, 0.3);
      mainScene.add(ambientLight);

      const pointLight = new DirectionalLight(0xffffff, 0.4);
      pointLight.position.set(0, 1, 0);
      mainScene.add(pointLight);

      // 创建多个心形模型
      for (let i = 0; i < 10; i++) {
        objLoader.load("../../public/img/heart_3.obj", function (object) {
          let heart = object.children[0];
          // 缩放心形模型
          heart.geometry.scale(0.12, 0.12, 0.12);
          // 随机选择颜色
          let color =
            heartColors[Math.floor(Math.random() * heartColors.length)];
          // 设置材质
          heart.material = new MeshPhongMaterial({
            color: color,
            transparent: true,
            opacity: 1,
            scale: 1,
          });

          // 随机设置位置
          heart.position.set(
            getRandomRange(-3, 5), // x位置
            getRandomRange(-10, 5), // y位置
            getRandomRange(-4, 3) // z位置
          );

          // 设置旋转方向
          heart.rotationDirection = {
            x: Math.random() > 0.5 ? 0.03 : -0.03,
            y: Math.random() > 0.5 ? 0.03 : -0.03,
            z: Math.random() > 0.5 ? 0.03 : -0.03,
          };

          heartGroup.add(heart);
          hearts.push(heart);
        });
      }

      /**
       * 心形模型动画
       * 实现心形模型的旋转和上下浮动
       */
      function animateHearts() {
        requestAnimationFrame(animateHearts);
        hearts.forEach((heart) => {
          if (heart) {
            heart.rotation.y += heart.rotationDirection.y; // 旋转
            heart.position.y += 0.03; // 向上移动
            if (heart.position.y > 5) {
              heart.position.y = -5; // 循环到底部
            }
          }
        });
      }

      animateHearts();

      /**
       * 获取随机范围内的数值
       * @param {number} min - 最小值
       * @param {number} max - 最大值
       * @returns {number} 返回区间内的随机数
       */
      function getRandomRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      // ===== 3D文字加载和创建 =====
      const fileLoader = new FileLoader();
      fileLoader.setResponseType("arraybuffer");
      // 加载字体文件
      fileLoader.load("../../public/img/oppo.zip", (data) => {
        new JSZip().loadAsync(data).then((zip) => {
          const firstFile = Object.keys(zip.files)[0];
          zip
            .file(firstFile)
            .async("string")
            .then((content) => {
              // 字体配置
              let fontOptions = {
                font: new FontLoader().parse(JSON.parse(content)),
                size: 0.3,
                height: 0,
                curveSegments: 2,
              };

              // 创建文字网格
              let textMeshes = [];
              let messages = confessionList;
              // 复制消息以创建更多文字
              for (let i = 0; i < 5; i++) messages = messages.concat(messages);

              // 文字材质
              const textMaterial = new MeshPhongMaterial({
                color: 0,
                emissive: 0xff8cab,
                emissiveIntensity: 0.9,
                transparent: false,
              });

              // 计算网格布局
              const gridCellWidth = 1;
              const gridCellHeight = 1;
              const gridColumns = Math.ceil((5.5 + 4) / gridCellWidth);
              const gridRows = Math.ceil((6 + 6.5) / gridCellHeight);

              /**
               * 计算网格位置
               * @param {number} columns - 列数
               * @param {number} rows - 行数
               * @param {number} total - 总数
               * @returns {Array} 返回网格位置数组
               */
              function calculateGridPositions(columns, rows, total) {
                let positions = [];
                const totalCells = columns * rows;
                const step = Math.max(Math.floor(totalCells / total), 1);

                for (
                  let i = 0;
                  i < totalCells && positions.length < total;
                  i += step
                ) {
                  positions.push({
                    gridX: i % columns,
                    gridY: Math.floor(i / columns),
                  });
                }
                return positions;
              }

              // 创建文字网格
              const totalMessages = messages.length;
              const gridPositions = calculateGridPositions(
                gridColumns,
                gridRows,
                totalMessages
              );
              let largeTextCount = 0;
              const largeTextLimit = Math.floor(messages.length * 0.1);

              // 创建每条消息的3D文字
              messages.forEach((text, index) => {
                // 随机大小生成函数
                let getRandomSize = () => {
                  let rand = Math.random();
                  return rand < 0.5
                    ? Math.sqrt(rand / 2)
                    : 1 - Math.sqrt((1 - rand) / 2);
                };

                // 计算文字大小
                let size = getRandomRange(0.15, 0.25) + getRandomSize() * 0.1;
                if (largeTextCount >= largeTextLimit) {
                  size = getRandomRange(0.1, 0.15);
                } else if (size > 0.25) {
                  largeTextCount++;
                }

                // 创建文字几何体
                fontOptions.size = size;
                let textGeometry = new TextGeometry(text, fontOptions);
                let textMesh = new Mesh(textGeometry, textMaterial);
                textGeometry.center();

                // 设置文字位置
                let zPos = -2 + (size - 0.1) * (8 / (0.45 - 0.1));
                if (index < gridPositions.length) {
                  const { gridX, gridY } = gridPositions[index];
                  let xPos =
                    -4 + gridX * gridCellWidth + Math.random() * gridCellWidth;
                  let yPos =
                    -5 +
                    gridY * gridCellHeight +
                    Math.random() * gridCellHeight;
                  textMesh.position.set(xPos, yPos, zPos);
                  mainScene.add(textMesh);
                  textMeshes.push(textMesh);
                }
              });

              // 文字颜色动画
              let color1 = new Color(0xff8cab); // 粉红色
              let color2 = new Color(0x7eb8bb); // 青色
              let color3 = new Color(0xff8d8d); // 浅红色

              /**
               * 文字颜色动画
               * 实现文字颜色的渐变效果
               */
              function animateTextColors() {
                requestAnimationFrame(animateTextColors);
                let cycleLength = 10;
                let phase =
                  ((Date.now() * 0.001) % cycleLength) / (cycleLength / 3);
                let currentColor;

                // 在三种颜色之间循环
                if (phase < 1) {
                  let t = phase;
                  currentColor = color1.clone().lerp(color2, t);
                } else if (phase < 2) {
                  let t = phase - 1;
                  currentColor = color2.clone().lerp(color3, t);
                } else {
                  let t = phase - 2;
                  currentColor = color3.clone().lerp(color1, t);
                }

                // 更新每个文字的颜色和位置
                textMeshes.forEach((mesh) => {
                  if (!mesh.userData.speedY) {
                    mesh.userData.speedY = 0.02 + Math.random() * 0.02;
                  }
                  mesh.position.y += mesh.userData.speedY;
                  if (mesh.position.y > 5) {
                    mesh.position.y = -5.5;
                  }
                  mesh.material.emissive.set(currentColor);
                });
              }

              animateTextColors();
            });
        });
      });

      // ===== 后期处理效果 =====
      // 添加渲染通道
      composer.addPass(new RenderPass(mainScene, mainCamera));
      // 添加泛光效果
      const bloomPass = new UnrealBloomPass(
        new Vector2(window.innerWidth, window.innerHeight),
        0.5, // 强度
        0.04, // 半径
        0.85 // 阈值
      );
      bloomPass.threshold = 0.2;
      bloomPass.strength = 1.4;
      bloomPass.radius = 1;
      composer.addPass(bloomPass);

      // 添加伽马校正
      const gammaPass = new ShaderPass(GammaCorrectionShader);
      composer.addPass(gammaPass);
      mainRenderer.setPixelRatio(window.devicePixelRatio);

      // 主动画循环
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        composer.render();
      };

      // 延迟启动动画
      setTimeout(() => {
        animate();
      }, 100);
    };

    // 返回组件模板
    return () => h("div", webglContainer);
  },
};

// 创建并导出Vue组件
var finalComponent = defineComponent(loveComponent, [
  ["__scopeId", "data-v-4651a0ba"],
]);
export { finalComponent as default };

// ====================== 恢复丢失的代码逻辑 ======================
class rt extends Se {
  constructor(t, e = {}) {
    const i = e.font;
    if (i === void 0) super();
    else {
      const u = i.generateShapes(t, e.size);
      e.depth = e.height !== void 0 ? e.height : 50;
      e.bevelThickness === void 0 && (e.bevelThickness = 10);
      e.bevelSize === void 0 && (e.bevelSize = 8);
      e.bevelEnabled === void 0 && (e.bevelEnabled = !1);
      super(u, e);
    }
    this.type = "TextGeometry";
  }
}
