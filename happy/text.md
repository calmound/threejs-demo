# Three.js 新年快乐动画教程

## 项目概述

这是一个使用 Vue 3 和 Three.js 创建的新年快乐动画项目。项目通过 Three.js 渲染了一个交互式的 3D 场景，包括烟花效果、3D 文字和粒子系统。

## 技术栈

- Vue 3
- Three.js
- Vite
- TypeScript

## 项目结构

```
happy/
├── src/
│   ├── components/
│   │   └── ThreeScene.vue   # 主要的 3D 场景组件
│   ├── utils/
│   │   └── fireworks.js     # 烟花效果管理
│   ├── App.vue              # 根组件
│   └── main.js              # 应用入口
└── index.html
```

## 关键功能

### 1. 3D 场景初始化

在 `ThreeScene.vue` 中，我们通过 Three.js 初始化了一个完整的 3D 渲染环境：

- 创建场景（`THREE.Scene`）
- 设置相机（`THREE.PerspectiveCamera`）
- 配置渲染器（`THREE.WebGLRenderer`）
- 添加环境光和方向光

### 2. 3D 文字渲染

使用 Three.js 的 `FontLoader` 和 `TextGeometry` 创建 "新年快乐" 文字：

- 加载自定义字体
- 设置文字几何体参数
- 应用材质和光照效果

### 3. 烟花效果

通过自定义的 `FireworksManager` 类管理烟花动画：

- 随机生成烟花
- 控制烟花粒子运动
- 添加颜色和爆炸效果

### 4. 粒子系统

创建了一个包含 1000 个粒子的动态粒子系统：

- 随机分布粒子
- 设置粒子颜色
- 实现粒子运动动画

## 核心代码解析

### 1. 烟花系统详解

烟花系统是通过 `Firework` 和 `FireworksManager` 两个类实现的复杂动画效果。

#### Firework 类的关键方法

##### 1.1 随机颜色生成

```javascript
getRandomColor() {
  const colors = [
    new THREE.Color(0xff0000),   // 红色
    new THREE.Color(0x00ff00),   // 绿色
    new THREE.Color(0x0000ff),   // 蓝色
    // ... 更多颜色
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
```

这个方法提供了丰富的烟花颜色选择，每次随机选择一种颜色。

##### 1.2 烟花爆炸模式

```javascript
createExplosionPattern(baseVelocity, count, pattern) {
  const velocities = [];
  switch (pattern) {
    case "sphere":  // 球形爆炸
      for (let i = 0; i < count; i++) {
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;
        const velocity = new THREE.Vector3(
          Math.cos(theta) * Math.sin(phi),
          Math.sin(theta) * Math.sin(phi),
          Math.cos(phi)
        );
        velocity.multiplyScalar(baseVelocity * (1 + Math.random()));
        velocities.push(velocity);
      }
      break;
    // 其他爆炸模式: ring, willow
  }
  return velocities;
}
```

提供了三种烟花爆炸模式：

- `sphere`：球形均匀扩散
- `ring`：环形扩散
- `willow`：柳树形状扩散

##### 1.3 烟花爆炸实现

```javascript
explode() {
  const baseColor = this.getRandomColor();
  const positions = this.particlePositions;
  this.particleVelocities = [];

  // 初始化粒子位置和速度
  for (let i = 0; i < this.particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = this.mesh.position.x;
    positions[i3 + 1] = this.mesh.position.y;
    positions[i3 + 2] = this.mesh.position.z;

    const velocity = new THREE.Vector3(
      Math.cos(theta) * Math.sin(phi),
      Math.sin(theta) * Math.sin(phi),
      Math.cos(phi)
    );

    velocity.multiplyScalar(2 + Math.random() * 3);
    this.particleVelocities.push(velocity);
  }

  // 创建粒子系统
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.3,
    color: baseColor,
    transparent: true,
    blending: THREE.AdditiveBlending
  });

  this.particles = new THREE.Points(this.particleGeometry, particleMaterial);
  this.scene.add(this.particles);
}
```

#### FireworksManager 类

```javascript
class FireworksManager {
  constructor(scene) {
    this.scene = scene;
    this.fireworks = [];
  }

  addFirework() {
    // 随机生成烟花位置
    const position = new THREE.Vector3(
      (Math.random() - 0.5) * 100,
      0,
      (Math.random() - 0.5) * 100
    );
    const firework = new Firework(this.scene, position);
    this.fireworks.push(firework);
  }

  update() {
    // 更新和管理所有烟花
    this.fireworks.forEach((firework) => {
      // 更新烟花状态
    });
  }
}
```

### 2. 3D 文字渲染详解

```javascript
const addText = () => {
  const loader = new FontLoader();
  loader.load("/fonts/FangSong_Regular.json", (font) => {
    const textGeometry = new TextGeometry("新年快乐", {
      font: font,
      size: 14, // 文字大小
      height: 3, // 文字深度
      curveSegments: 36, // 曲线分段数
      bevelEnabled: true, // 启用倒角
      bevelThickness: 0.4,
      bevelSize: 0.3,
      bevelSegments: 10,
    });

    const textMaterial = new THREE.MeshStandardMaterial({
      color: "rgb(255, 0, 0)",
      roughness: 0.6,
      metalness: 0.5,
      emissive: "rgb(255, 76, 21)",
    });

    textMesh = new THREE.Mesh(textGeometry, textMaterial);
    scene.add(textMesh);
  });
};
```

### 3. 动画循环

```javascript
const animate = () => {
  requestAnimationFrame(animate);

  // 更新烟花
  fireworksManager.update();

  // 更新粒子系统
  updateParticles();

  // 渲染场景
  renderer.render(scene, camera);
};
```

## 关键代码片段

### 场景初始化

```javascript
const init = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 20, 100);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
};
```

### 3D 文字创建

```javascript
const addText = () => {
  const loader = new FontLoader();
  loader.load("/fonts/FangSong_Regular.json", (font) => {
    const textGeometry = new TextGeometry("新年快乐", {
      font: font,
      size: 14,
      height: 3,
      // 其他几何体参数
    });

    const textMaterial = new THREE.MeshStandardMaterial({
      color: "rgb(255, 0, 0)",
      // 材质属性
    });

    textMesh = new THREE.Mesh(textGeometry, textMaterial);
    scene.add(textMesh);
  });
};
```
