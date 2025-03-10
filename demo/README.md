# 粒子球体 (Particle Sphere)

这是一个基于Three.js的3D粒子动画演示项目，展示了一个由25,000个粒子点构成的旋转球体。

## 功能特点

- **粒子系统**：使用25,000个粒子点构建球体形状
- **视觉效果**：
  - 粒子颜色渐变
  - 辉光效果
  - 运动轨迹效果
- **相机控制**：
  - 拖拽旋转视角
  - 滚轮缩放
  - 双击重置视图

## 技术实现

- **Three.js**：3D渲染引擎
- **粒子系统**：使用THREE.Points和BufferGeometry实现
- **后期处理**：使用EffectComposer实现辉光和运动轨迹效果
- **动画系统**：使用requestAnimationFrame实现平滑动画

## 如何使用

- **交互操作**：
  - 鼠标拖拽：旋转视角
  - 鼠标滚轮：缩放视图
  - 双击：重置视图到初始状态

## 项目结构

- `index.html`：主HTML文件，包含页面结构
- `src/main.js`：主JavaScript文件，包含所有Three.js代码和交互逻辑

## 运行方式

使用Vite开发服务器运行项目：

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173 查看效果。

## 兼容性

需要支持WebGL的现代浏览器。
