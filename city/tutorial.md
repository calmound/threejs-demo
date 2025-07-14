# 3D 城市动画场景实战教程

本教程将引导您使用 [Three.js](https://threejs.org/docs/) 和 [GSAP](https://gsap.com/docs/v3/) 创建一个动态的 3D 城市动画场景。您将从一个空白页面开始，逐步完成场景搭建、灯光布置、建筑生成、动画实现、相机控制等核心环节。

---

## 第一章：项目基础搭建

任何 Web 项目都始于一个 HTML 文件。该文件是网页的骨架，负责装载 3D 场景、定义页面样式，并引入所有必需的脚本。

首先，创建项目根目录，并在其中新建一个 `index.html` 文件，然后将以下完整内容复制进去。

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>3D城市可视化</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        background: #000;
        font-family: Arial, sans-serif;
        color: white;
      }

      #container {
        position: relative;
        width: 100vw;
        height: 100vh;
      }

      /* 相机控制按钮样式 */
      .camera-controls {
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 100;
        display: flex;
        gap: 15px;
        background: rgba(0, 0, 0, 0.7);
        padding: 15px 20px;
        border-radius: 15px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
      }

      .camera-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        transition: all 0.3s ease;
        backdrop-filter: blur(5px);
        min-width: 80px;
        text-align: center;
      }

      .camera-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.5);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      }

      .camera-btn.active {
        background: rgba(251, 53, 80, 0.8);
        border-color: rgba(251, 53, 80, 1);
        box-shadow: 0 0 20px rgba(251, 53, 80, 0.5);
      }

      .camera-btn.active:hover {
        background: rgba(251, 53, 80, 0.9);
      }
      /* 当前模式显示 */
      .current-mode {
        position: absolute;
        top: 50%;
        right: 30px;
        transform: translateY(-50%);
        z-index: 100;
        background: rgba(0, 0, 0, 0.8);
        padding: 10px 15px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(10px);
        font-size: 12px;
        color: rgba(255, 255, 255, 0.9);
        text-align: center;
      }

      .mode-name {
        color: #ff6b6b;
        font-weight: bold;
        font-size: 14px;
        margin-bottom: 5px;
      }
    </style>
  </head>
  <body>
    <div id="container"></div>

    <!-- 相机控制按钮 -->
    <div class="camera-controls">
      <button class="camera-btn active" id="circleBtn" data-mode="circle">
        🔄 圆形轨道
      </button>
      <button class="camera-btn" id="figure8Btn" data-mode="figure8">
        ∞ 8字路径
      </button>
      <button class="camera-btn" id="spiralBtn" data-mode="spiral">
        🌀 螺旋塔
      </button>
      <button class="camera-btn" id="waveBtn" data-mode="wave">
        🌊 海浪漫游
      </button>
    </div>

    <!-- 当前模式显示 -->
    <div class="current-mode">
      <div class="mode-name" id="currentModeName">圆形轨道</div>
      <span>当前相机模式</span>
    </div>

    <!-- Import Map -->
    <script type="importmap">
      {
        "imports": {
          "three": "https://unpkg.com/three@0.178.0/build/three.module.js",
          "gsap": "https://unpkg.com/gsap@3.13.0/index.js"
        }
      }
    </script>

    <!-- Main Application -->
    <script type="module" src="index.js"></script>
  </body>
</html>
```

- `<body>` 内的 `<div id="container"></div>` 是 Three.js 场景的挂载点。
- `<div class="camera-controls">` 和 `<div class="current-mode">` 是场景的 UI 元素，用于后续的相机切换交互。
- `<style>` 标签内包含了所有的 CSS 样式，用于定义页面布局、背景、字体和按钮的美观效果。
- `<script type="importmap">` 用于声明 ES 模块的导入路径。这允许浏览器直接从 URL 加载 `three` 和 `gsap` 库，无需本地安装或构建步骤。
- `<script type="module" src="index.js">` 告诉浏览器以模块方式加载和执行 `index.js` 文件，这是所有 3D 逻辑的存放处。

接下来，在 `index.html` 旁边创建一个空的 `index.js` 文件。后续所有 JavaScript 代码都将写入此文件。

---

## 第二章：初始化三维世界

搭建三维场景需要三个核心组件：渲染器（Renderer）、场景（Scene）和相机（Camera）。

- **场景**：一个容器，用于存放所有三维物体、光源和相机。
- **相机**：决定了观察者在场景中的视角、位置和视野范围。
- **渲染器**：将相机捕捉到的场景画面计算并绘制到浏览器窗口中。

在 `index.js` 中添加以下代码，以完成基础环境的设置。

```js
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
```

- `import * as THREE from "three"` 从 import-map 中导入 Three.js 库。
- `THREE.WebGLRenderer` 是 Three.js 的渲染器实现，`{ antialias: true }` 选项可以使物体边缘更平滑。
- `renderer.setPixelRatio` 和 `renderer.setSize` 确保渲染输出能够清晰地匹配不同设备和窗口尺寸。
- `container.appendChild(renderer.domElement)` 将渲染器生成的 `<canvas>` 元素插入到 HTML 的容器中。
- `THREE.PerspectiveCamera` 创建一个透视相机，模拟人眼的视觉效果。参数分别定义了视野角度、宽高比、近裁切面和远裁切面。
- `camera.position.set(...)` 用于设定相机在三维空间中的具体坐标。

为了让场景能够持续显示并响应变化，需要一个渲染循环。同时，为了让场景在浏览器窗口大小改变时能自适应调整，还需要一个窗口监听事件。

在 `index.js` 末尾追加以下代码：

```js
// ... existing code ...
const scene = new THREE.Scene();

// 事件监听和程序启动
window.addEventListener("resize", onWindowResize, false); // 监听窗口大小变化

animate(); // 启动渲染循环

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
```

- `animate` 函数是项目的核心循环。`requestAnimationFrame` 会在浏览器下次重绘前调用指定函数，从而形成一个高效的动画循环。
- `renderer.render(scene, camera)` 在每一帧中执行实际的渲染操作。
- `onWindowResize` 函数确保当浏览器窗口尺寸变化时，相机的宽高比和渲染器的尺寸能同步更新，避免画面变形。
- `window.addEventListener("resize", ...)` 注册了窗口大小变化的监听器。

📌 当前项目已可运行，请运行项目查看效果，并视情况截图记录。

> 提示：此时，您应该会看到一个全黑的浏览器窗口。这是正常的，因为场景中还没有任何可见物体或光源。

---

## 第三章：布置灯光与环境

一个没有光的世界是不可见的。为了照亮场景中的物体，需要添加光源。同时，为了营造氛围，可以设置背景色和雾效。

在场景创建代码之后，添加以下代码来配置雾效和背景色。

```js
// ... existing code ...
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x1e2630, 0.002); // 添加指数雾效果
renderer.setClearColor(scene.fog.color); // 背景色与雾色保持一致
```

- `scene.fog` 用于在场景中创建雾效，`THREE.FogExp2` 是一种指数增长的雾，距离相机越远的物体会显得越模糊。
- `renderer.setClearColor` 用于设置渲染器的背景颜色，这里将其设置为与雾相同的颜色，以实现平滑的视觉过渡。

接下来，添加不同类型的光源，以构建一个富有层次的光照环境。

```js
// ... existing code ...
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
```

- `THREE.DirectionalLight` 模拟平行光，如同太阳光。代码中设置了一个主光源和一个辅助光源，从不同方向和颜色照射，使物体更具立体感。
- `THREE.AmbientLight` 提供一个均匀的环境光，它会无差别地照亮场景中的所有物体，可以用来提升场景的整体亮度，防止阴影部分过黑。
- `THREE.PointLight` 模拟一个从单一点向所有方向发射的光源，类似于灯泡。
- `scene.add()` 方法用于将创建好的光源添加到场景中，使其生效。

---

## 第四章：创建环境元素

现在场景有了光，可以开始添加可见的物体了。首先创建一个作为天空背景的穹顶和一个作为地面的平面。

在光源设置代码之后，添加以下代码来创建穹顶。

```js
// ... existing code ...
scene.add(pointLight);

// 穹顶创建 - 作为天空背景
const domeGeometry = new THREE.IcosahedronGeometry(700, 1); // 二十面体，半径700
const domeMaterial = new THREE.MeshPhongMaterial({
  color: 0xfb3550, // 粉红色
  flatShading: true, // 平面着色，呈现低多边形效果
  side: THREE.BackSide, // 渲染内表面（相机在内部）
});
scene.add(new THREE.Mesh(domeGeometry, domeMaterial));
```

- 在 Three.js 中，一个可见物体由几何体（Geometry）和材质（Material）组成，并通过网格（Mesh）组合后添加到场景中。
- `THREE.IcosahedronGeometry` 创建一个二十面体的几何结构。
- `THREE.MeshPhongMaterial` 是一种可以响应光照的材质。`flatShading: true` 使模型的每个面都使用单一颜色，呈现出低多边形（Low Poly）风格。`side: THREE.BackSide` 表示只渲染几何体的内表面，因为相机将处于穹顶内部。

接下来，添加地面平面和网格辅助线。

```js
// ... existing code ...
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
```

- `THREE.PlaneGeometry` 用于创建一个矩形平面。
- `ground.rotation.x = Math.PI / 2` 将平面沿 X 轴旋转 90 度，使其从默认的垂直状态变为水平状态，作为地面。
- `THREE.GridHelper` 用于在场景中创建一个网格平面，它对于在开发阶段观察和调试物体的位置非常有帮助。

📌 当前项目已可运行，请运行项目查看效果，并视情况截图记录。

> 提示：此时，您应该能看到一个带有网格的深色地面和粉红色的天空背景。相机正在缓缓移动（尽管此时场景中心空无一物）。

---

## 第五章：程序化生成建筑群

接下来，将通过循环程序化地生成大量建筑物，构建出城市的核心景观。

在添加网格辅助线之后，定义建筑物的基本几何体、颜色和存储数组。

```js
// ... existing code ...
scene.add(new THREE.GridHelper(400, 16)); // 400x400网格，16个分割，更密集的网格

// 建筑物生成 - 程序化创建城市建筑群
const geometry = new THREE.BoxGeometry(10, 10, 10); // 10x10x10的立方体
const colors = [0xfb3550, 0xffffff, 0x000000]; // 颜色数组：粉红、白色、黑色
const buildings = []; // 存储所有建筑物的数组
```

- `THREE.BoxGeometry` 定义了一个立方体的几何形状，它将作为所有建筑物的基础。
- `colors` 数组预设了几种颜色，用于随机分配给不同的建筑物。

然后，使用一个 `for` 循环来创建 200 个建筑物，并将它们随机放置在地面上。

```js
// ... existing code ...
const buildings = []; // 存储所有建筑物的数组

// 循环创建200个建筑物
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

  scene.add(building);
}
```

- 循环体内部为每个建筑创建独立的 `MeshPhongMaterial`，并从 `colors` 数组中随机选择一个颜色。
- `building.position` 属性用于设置每个建筑物在场景中的位置。`Math.random()` 用于生成随机的 X 和 Z 坐标，使建筑群看起来错落有致。
- `building.userData` 是一个可自定义的对象，用于存储与该对象相关的任意数据。这里用它来保存建筑物的初始信息，为未来的交互功能预留。
- 最后，将创建的每个 `building` 添加到 `scene` 中，并在 `buildings` 数组中保存其引用，以便后续进行动画操作。

📌 当前项目已可运行，请运行项目查看效果，并视情况截图记录。

> 提示：现在，场景中央应该出现了大量随机分布的、颜色各异的静态立方体块。

---

## 第六章：实现建筑与灯光动画

静态的城市缺乏活力。现在引入 GSAP 动画库，让建筑和灯光动起来。为了实现更加丰富多样的动画效果，首先将建筑进行分组。

在建筑物生成代码之前，定义用于分组的 `buildingGroups` 对象。

```js
// ... existing code ...
const buildings = []; // 存储所有建筑物的数组

// 建筑物分组存储 - 用于不同的动画效果
const buildingGroups = {
  group1: [], // 第一组：缩放动画
  group2: [], // 第二组：旋转动画
  group3: [], // 第三组：位置动画
  group4: [], // 第四组：颜色变化
};
```

接下来，修改建筑生成的 `for` 循环，在创建每个建筑物时，根据其索引将其分配到不同的组中。

```js
// ... existing code ...
for (let i = 0; i < 200; i++) {
  // ... existing code ...
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
```

- `i % 4` 运算将建筑物均匀地分配到 4 个组中。
- `switch` 语句根据 `groupIndex` 的值，将当前 `building` 对象推入 `buildingGroups` 中对应的数组。

在主程序启动区域，调用即将创建的动画函数。

```js
// ... existing code ...
window.addEventListener("resize", onWindowResize, false); // 监听窗口大小变化

startAnimation(); // 启动建筑物动画循环
startDynamicLighting(); // 启动动态光照
animate(); // 启动渲染循环
```

现在，创建 `startAnimation` 函数，它负责为不同组的建筑应用不同的 GSAP 动画效果。

```js
// ... existing code ...
}

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
```

- `gsap.to()` 是 GSAP 的核心方法，用于创建补间动画。它接收目标对象和动画参数。
- 通过对不同组建筑的 `scale`（缩放）、`rotation`（旋转）、`position`（位置）和 `material.color`（材质颜色）等属性进行动画处理，实现了多样化的视觉效果。
- `repeat: -1` 使动画无限循环，`yoyo: true` 使动画在每次迭代结束时反向播放。`delay` 用于错开每个建筑动画的开始时间，形成波浪或序列效果。
- `redistributeBuildings` 函数使用 GSAP 定期改变所有建筑的位置，增加了场景的动态性。

接下来，创建 `startDynamicLighting` 函数，为场景中的光源也添加动画。

```js
// ... existing code ...
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
```

- 此函数同样使用 `gsap.to()` 来改变光源的 `intensity`（强度）、`position`（位置）和 `color`（颜色）属性，使整个场景的光影效果更加生动。

📌 当前项目已可运行，请运行项目查看效果，并视情况截图记录。

> 提示：现在，所有的建筑和灯光都应该在动态变化，城市呈现出一派生机勃勃的景象。

---

## 第七章：设计相机巡航系统

为了能从不同角度欣赏这座城市，需要一个可以切换巡航路径的相机系统。

首先，在项目顶部定义相机相关的模式和状态变量。

```js
// ... existing code ...
const buildingGroups = {
  // ...
};

// 交互系统设置
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredBuilding = null;

// 相机模式设置
const cameraModes = ["circle", "figure8", "spiral", "wave"];
let currentCameraMode = 0;
let currentCameraAnimation = null; // 存储当前相机动画的引用
```

- `cameraModes` 数组定义了所有可用的相机运动模式。
- `currentCameraAnimation` 变量用于存储当前正在运行的 GSAP 相机动画实例，以便在切换模式时能够停止它。

在主程序启动区域，调用相机动画启动函数。

```js
// ... existing code ...
startAnimation(); // 启动建筑物动画循环
startDynamicLighting(); // 启动动态光照
startCameraAnimation(); // 启动相机动画
animate(); // 启动渲染循环
```

接下来，创建相机动画的相关函数。`startCameraAnimation` 函数负责初始化，而 `switchCameraMode` 函数则包含了所有相机路径的动画逻辑。

```js
// ... existing code ...
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
```

- `currentCameraAnimation.kill()` 用于立即停止前一个相机动画，确保动画切换的平顺。
- 每个 `case` 块都定义了一种不同的相机运动轨迹。动画的目标是相机的自定义属性 `animAngle`。
- `onUpdate` 回调函数在动画的每一帧都被调用。它内部的复杂数学运算（三角函数、李萨如图形等）根据 `animAngle` 的当前值实时计算出相机新的 `position`，从而形成复杂的运动路径。
- `camera.lookAt(scene.position)` 确保无论相机如何移动，其镜头始终朝向场景的原点。

---

## 第八章：连接 UI 实现交互

最后一步是让 HTML 中创建的按钮能够真正地控制相机模式的切换。

首先添加 `updateModeDisplay` 函数，用于在切换模式时更新界面上的文本显示。

```js
// ... existing code ...
  console.log("相机模式切换到:", mode);
}

// 更新模式显示
function updateModeDisplay(modeName) {
  const modeNameElement = document.getElementById("currentModeName");
  if (modeNameElement) {
    modeNameElement.textContent = modeName;
  }
}
```

接下来，在主程序启动区域，添加一个 DOM 内容加载完成的事件监听器，并在其中调用按钮设置函数。

```js
// ... existing code ...
window.addEventListener("resize", onWindowResize, false); // 监听窗口大小变化

// 等待DOM加载完成后设置按钮事件
window.addEventListener("DOMContentLoaded", setupCameraButtons);

startAnimation(); // 启动建筑物动画循环
// ... existing code ...
```

- `DOMContentLoaded` 事件确保在尝试获取和操作 DOM 元素（如按钮）之前，HTML 页面已经完全加载和解析完毕。

最后，实现 `setupCameraButtons` 函数，为每个按钮绑定点击事件。

```js
// ... existing code ...
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
```

- `document.querySelectorAll(".camera-btn")` 获取页面上所有带有 `camera-btn` 类的按钮。
- `forEach` 循环为每个按钮添加一个 `click` 事件监听器。
- 当按钮被点击时，回调函数会：
  1.  通过 `getAttribute("data-mode")` 获取该按钮代表的相机模式。
  2.  移除所有按钮的 `active` CSS 类，重置样式。
  3.  为被点击的当前按钮添加 `active` 类，使其高亮显示。
  4.  调用 `switchCameraMode(mode)` 函数，执行真正的相机模式切换。

📌 当前项目已可运行，请运行项目查看效果，并视情况截图记录。

> 提示：项目现已全部完成。您可以点击页面底部的按钮，在“圆形轨道”、“8 字路径”、“螺旋塔”和“海浪漫游”四种相机模式之间自由切换，从不同视角欣赏这座动态的 3D 城市。

---

## 总结

恭喜您完成了整个 3D 城市动画场景的搭建！通过本教程，您实践了 Three.js 的核心概念，包括场景、相机、渲染器、灯光、几何体、材质，并结合 GSAP 实现了复杂的程序化动画和相机控制。

希望这个项目能成为您探索 Web 3D 世界的起点。
