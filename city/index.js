// ===========================================
// 3D城市动画场景 - Three.js + GSAP实现
// ===========================================

// 导入依赖
import * as THREE from "three";
import { gsap } from "gsap";

// 渲染器设置 - 负责将3D场景渲染到网页上
const renderer = new THREE.WebGLRenderer({ antialias: true }); // 开启抗锯齿
renderer.setPixelRatio(window.devicePixelRatio); // 适配高清屏幕
renderer.setSize(window.innerWidth, window.innerHeight); // 设置渲染尺寸为全屏

// 将渲染器的canvas元素添加到页面容器中
const container = document.getElementById("container");
container.appendChild(renderer.domElement);

// 相机设置 - 定义观察者的视角
const camera = new THREE.PerspectiveCamera(
  60, // 视野角度（度）
  window.innerWidth / window.innerHeight, // 宽高比
  1, // 近裁切面
  1000 // 远裁切面
);
camera.animAngle = 0; // 自定义属性：用于动画中的角度计算
// 设置相机初始位置（围绕原点的圆形轨道）
camera.position.set(
  Math.cos(camera.animAngle) * 400, // x坐标
  180, // y坐标（高度）
  Math.sin(camera.animAngle) * 400 // z坐标
);

// 场景设置 - 所有3D对象的容器
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x1e2630, 0.002); // 添加指数雾效果
renderer.setClearColor(scene.fog.color); // 背景色与雾色保持一致

// 光源设置 - 为场景提供光照
// 主光源：强白光从右上方照射
const mainLight = new THREE.DirectionalLight(0xffffff, 2);
mainLight.position.set(1, 1, 1);
scene.add(mainLight);

// 副光源：蓝色光从左下方照射，增加色彩层次
const secondaryLight = new THREE.DirectionalLight(0x002288, 1.5);
secondaryLight.position.set(-1, -1, -1);
scene.add(secondaryLight);

// 环境光：提供整体基础照明，防止阴影过暗
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// 动态点光源：移动的彩色光源
const pointLight = new THREE.PointLight(0xffaa00, 1, 200);
pointLight.position.set(0, 80, 0);
scene.add(pointLight);

// 穹顶创建 - 作为天空背景
const domeGeometry = new THREE.IcosahedronGeometry(700, 1); // 二十面体，半径700
const domeMaterial = new THREE.MeshPhongMaterial({
  color: 0xfb3550, // 粉红色
  flatShading: true, // 平面着色，呈现低多边形效果
  side: THREE.BackSide, // 渲染内表面（相机在内部）
});
scene.add(new THREE.Mesh(domeGeometry, domeMaterial));

// 地面创建 - 为建筑物提供基础平面 (调整为更适合的大小)
const groundGeometry = new THREE.PlaneGeometry(400, 400); // 调整为400x400的正方形平面
const groundMaterial = new THREE.MeshPhongMaterial({
  color: 0x222a38, // 深蓝灰色
  transparent: true, // 启用透明度
  opacity: 0.8, // 80%不透明度
  flatShading: true, // 平面着色
  side: THREE.DoubleSide, // 双面渲染
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = Math.PI / 2; // 旋转90度使其水平
scene.add(ground);

// 网格辅助线 - 帮助理解空间结构 (调整网格大小和密度)
scene.add(new THREE.GridHelper(400, 16)); // 400x400网格，16个分割，更密集的网格

// 建筑物生成 - 程序化创建城市建筑群
const geometry = new THREE.BoxGeometry(10, 10, 10); // 10x10x10的立方体
const colors = [0xfb3550, 0xffffff, 0x000000]; // 颜色数组：粉红、白色、黑色
const buildings = []; // 存储所有建筑物的数组

// 建筑物分组存储 - 用于不同的动画效果
const buildingGroups = {
  group1: [], // 第一组：缩放动画
  group2: [], // 第二组：旋转动画
  group3: [], // 第三组：位置动画
  group4: [], // 第四组：颜色变化
};

// 交互系统设置
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredBuilding = null;

// 相机模式设置
const cameraModes = ["circle", "figure8", "spiral", "wave"];
let currentCameraMode = 0;
let currentCameraAnimation = null; // 存储当前相机动画的引用

// 循环创建100个建筑物
for (let i = 0; i < 200; i++) {
  // 为每个建筑物随机选择颜色
  const material = new THREE.MeshPhongMaterial({
    color: colors[Math.floor(Math.random() * 3)], // 随机选择颜色
    flatShading: true, // 平面着色
  });

  // 创建建筑物网格并添加到场景
  const building = new THREE.Mesh(geometry, material);

  // 更紧密的初始位置分布 - 减小范围从400x400到250x250
  building.position.x = -125 + Math.random() * 250; // X坐标：-125到125
  building.position.z = -125 + Math.random() * 250; // Z坐标：-125到125
  building.position.y = 0;

  // 存储原始颜色和位置用于交互重置
  building.userData = {
    originalColor: colors[Math.floor(Math.random() * 3)],
    originalPosition: {
      x: building.position.x,
      z: building.position.z,
    },
  };

  buildings.push(building); // 保存引用用于动画

  // 按组分配建筑物
  const groupIndex = i % 4;
  switch (groupIndex) {
    case 0:
      buildingGroups.group1.push(building);
      break;
    case 1:
      buildingGroups.group2.push(building);
      break;
    case 2:
      buildingGroups.group3.push(building);
      break;
    case 3:
      buildingGroups.group4.push(building);
      break;
  }

  scene.add(building);
}

// 事件监听和程序启动
window.addEventListener("resize", onWindowResize, false); // 监听窗口大小变化

// 等待DOM加载完成后设置按钮事件
window.addEventListener("DOMContentLoaded", setupCameraButtons);

startAnimation(); // 启动建筑物动画循环
startDynamicLighting(); // 启动动态光照
startCameraAnimation(); // 启动相机动画
animate(); // 启动渲染循环

// 建筑物分组动画系统 - 不同组有不同的动画效果
function startAnimation() {
  // 第一组：缩放波浪效果
  buildingGroups.group1.forEach((building, index) => {
    gsap.to(building.scale, {
      duration: 2 + Math.random(),
      y: 1 + Math.sin(index * 0.5) * 0.8,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
      delay: index * 0.1,
    });
  });

  // 第二组：旋转动画
  buildingGroups.group2.forEach((building, index) => {
    gsap.to(building.rotation, {
      duration: 4 + Math.random() * 2,
      y: Math.PI * 2,
      repeat: -1,
      ease: "none",
      delay: index * 0.05,
    });
  });

  // 第三组：上下浮动
  buildingGroups.group3.forEach((building, index) => {
    gsap.to(building.position, {
      duration: 3 + Math.random(),
      y: 5 + Math.sin(index * 0.3) * 3,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
      delay: index * 0.08,
    });
  });

  // 第四组：颜色变化 + 综合动画
  buildingGroups.group4.forEach((building, index) => {
    // 缩放动画
    gsap.to(building.scale, {
      duration: 1.5,
      x: 1 + Math.random() * 2,
      y: 1 + Math.random() * 15,
      z: 1 + Math.random() * 2,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
      delay: index * 0.1,
    });

    // 颜色变化动画
    gsap.to(building.material.color, {
      duration: 3,
      r: Math.random(),
      g: Math.random(),
      b: Math.random(),
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
      delay: index * 0.2,
    });
  });

  // 定期重新分配建筑物位置 - 更紧密的分布
  function redistributeBuildings() {
    buildings.forEach((building) => {
      gsap.to(building.position, {
        duration: 3 + Math.random() * 2,
        x: -125 + Math.random() * 250, // 缩小范围到250x250
        z: -125 + Math.random() * 250,
        ease: "power2.inOut",
      });
    });

    gsap.delayedCall(12, redistributeBuildings); // 延长间隔到12秒
  }

  redistributeBuildings();
}

// 动态光照系统
function startDynamicLighting() {
  // 主光源强度变化
  gsap.to(mainLight, {
    duration: 4,
    intensity: 0.5,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
  });

  // 副光源强度变化
  gsap.to(secondaryLight, {
    duration: 3,
    intensity: 2.5,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
    delay: 1.5,
  });

  // 点光源移动动画
  gsap.to(pointLight.position, {
    duration: 6,
    x: 150,
    z: -100,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
  });

  // 点光源颜色变化
  gsap.to(pointLight.color, {
    duration: 2,
    r: Math.random(),
    g: Math.random(),
    b: Math.random(),
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
  });

  // 环境光强度变化
  gsap.to(ambientLight, {
    duration: 5,
    intensity: 0.8,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
  });
}

// 相机动画系统 - 手动控制模式，无自动切换
function startCameraAnimation() {
  // 初始启动圆形模式
  switchCameraMode("circle");
}

// 切换相机模式函数
function switchCameraMode(mode) {
  // 停止当前动画
  if (currentCameraAnimation) {
    currentCameraAnimation.kill();
  }

  // 更新当前模式
  const modeIndex = cameraModes.indexOf(mode);
  if (modeIndex !== -1) {
    currentCameraMode = modeIndex;
  }

  // 根据模式启动对应动画
  switch (mode) {
    case "circle":
      // 经典圆形轨道 - 固定高度的平滑圆周运动
      currentCameraAnimation = gsap.to(camera, {
        duration: 8,
        animAngle: camera.animAngle + Math.PI * 2,
        ease: "none",
        repeat: -1,
        onUpdate: () => {
          camera.position.x = Math.cos(camera.animAngle) * 380;
          camera.position.z = Math.sin(camera.animAngle) * 380;
          camera.position.y = 180; // 固定高度
          camera.lookAt(scene.position);
        },
      });
      updateModeDisplay("圆形轨道");
      break;

    case "figure8":
      // 真正的8字形路径 - 两个相交的圆
      currentCameraAnimation = gsap.to(camera, {
        duration: 12,
        animAngle: camera.animAngle + Math.PI * 4, // 两个完整循环形成8字
        ease: "none",
        repeat: -1,
        onUpdate: () => {
          const t = camera.animAngle * 0.5; // 减慢角度变化
          // 李萨如曲线：x = sin(t), z = sin(2t) 形成8字
          camera.position.x = Math.sin(t) * 320;
          camera.position.z = Math.sin(2 * t) * 200;
          camera.position.y = 160 + Math.cos(t * 2) * 40; // 高度也做8字变化
          camera.lookAt(scene.position);
        },
      });
      updateModeDisplay("8字形路径");
      break;

    case "spiral":
      // 明显的螺旋上升下降 - 半径和高度大幅变化
      currentCameraAnimation = gsap.to(camera, {
        duration: 15,
        animAngle: camera.animAngle + Math.PI * 6, // 3圈螺旋
        ease: "none",
        repeat: -1,
        onUpdate: () => {
          const t = camera.animAngle;
          // 半径从200到500大幅变化
          const radius = 200 + Math.abs(Math.sin(t * 0.5)) * 300;
          camera.position.x = Math.cos(t) * radius;
          camera.position.z = Math.sin(t) * radius;
          // 高度从100到300大幅变化，形成螺旋塔
          camera.position.y = 100 + Math.abs(Math.sin(t * 0.5)) * 200;
          camera.lookAt(scene.position);
        },
      });
      updateModeDisplay("螺旋塔");
      break;

    case "wave":
      // 海浪式运动 - 不规则的起伏路径
      currentCameraAnimation = gsap.to(camera, {
        duration: 10,
        animAngle: camera.animAngle + Math.PI * 3,
        ease: "none",
        repeat: -1,
        onUpdate: () => {
          const t = camera.animAngle;
          // 不规则的波浪形状，多个频率叠加
          const wave1 = Math.sin(t * 1.5) * 150;
          const wave2 = Math.sin(t * 3.7) * 80;
          const wave3 = Math.sin(t * 0.8) * 100;

          camera.position.x = wave1 + wave2;
          camera.position.z = wave3 + Math.cos(t * 2.1) * 120;
          // 高度也有复杂的波浪变化
          camera.position.y =
            140 + Math.sin(t * 2.3) * 60 + Math.cos(t * 1.1) * 30;
          camera.lookAt(scene.position);
        },
      });
      updateModeDisplay("海浪漫游");
      break;
  }

  console.log("相机模式切换到:", mode);
}

// 更新模式显示
function updateModeDisplay(modeName) {
  const modeNameElement = document.getElementById("currentModeName");
  if (modeNameElement) {
    modeNameElement.textContent = modeName;
  }
}

// 设置相机控制按钮
function setupCameraButtons() {
  const buttons = document.querySelectorAll(".camera-btn");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.getAttribute("data-mode");

      // 移除所有按钮的active类
      buttons.forEach((btn) => btn.classList.remove("active"));

      // 给当前按钮添加active类
      button.classList.add("active");

      // 切换相机模式
      switchCameraMode(mode);
    });
  });
}

// 窗口大小调整处理 - 保持渲染比例正确
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight; // 更新相机宽高比
  camera.updateProjectionMatrix(); // 更新投影矩阵
  renderer.setSize(window.innerWidth, window.innerHeight); // 更新渲染器尺寸
}

// 渲染循环 - 持续绘制场景
function animate() {
  requestAnimationFrame(animate); // 请求下一帧
  renderer.render(scene, camera); // 渲染场景
}
