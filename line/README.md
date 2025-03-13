# Three.js 动画线条示例

这个项目展示了如何使用Three.js和MeshLine库创建一个动画心形线条效果。整个效果看起来像是一个不断绘制的心形，非常生动有趣。

## 项目功能

1. 使用数学公式生成心形曲线
2. 通过MeshLine库创建平滑的线条效果
3. 实现线条的动画效果，看起来像是不断绘制的心形
4. 添加星星背景，增强视觉效果
5. 支持鼠标交互，可以旋转和缩放场景

## 如何运行

### 安装依赖

```bash
# 进入项目目录
cd threejs-demo/line

# 安装依赖
npm install
```

### 启动开发服务器

```bash
# 启动开发服务器
npm run dev
```

启动后，在浏览器中打开显示的地址（通常是 http://localhost:5173）即可查看效果。

## 技术实现原理

### 1. 心形曲线的数学公式

我们使用参数方程来生成心形曲线：

```javascript
const x = 16 * Math.pow(Math.sin(t), 3);
const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
```

这个公式会生成一个心形的轨迹，通过循环不同的t值（从0到2π），我们可以得到完整的心形曲线上的点。

### 2. MeshLine库的使用

MeshLine是一个Three.js的扩展库，它提供了比Three.js自带的LineBasicMaterial更强大的线条渲染功能：

- **MeshLineGeometry**：用于创建线条的几何体
- **MeshLineMaterial**：用于定义线条的外观

与普通的Three.js线条相比，MeshLine可以：
- 创建可变宽度的线条
- 支持虚线动画
- 更好的性能和视觉效果

### 3. 动画效果的实现

动画效果主要通过以下两种方式实现：

1. **虚线动画**：通过不断改变dashOffset属性，使线条看起来像是在不断绘制
   ```javascript
   lineMaterial.dashOffset -= 0.01;
   ```

2. **旋转动画**：通过改变mesh的旋转属性，使心形线条不断旋转
   ```javascript
   mesh.rotation.z += 0.005;
   ```

### 4. 解决线条自遮挡问题

为了解决线条自遮挡的问题，我们设置了以下属性：

```javascript
lineMaterial.transparent = true; // 启用透明
lineMaterial.depthTest = false; // 禁用深度测试
```

这样可以确保线条不会被自身遮挡，从而实现平滑的动画效果。

## 自定义修改

如果你想修改项目，这里有一些建议：

1. **改变线条颜色**：修改`lineMaterial`中的`color`属性
   ```javascript
   color: new THREE.Color(0xff0066), // 可以改为其他颜色
   ```

2. **调整线条宽度**：修改`lineMaterial`中的`lineWidth`属性
   ```javascript
   lineWidth: 1.5, // 可以调整为其他值
   ```

3. **改变动画速度**：修改`animate`函数中的相关值
   ```javascript
   lineMaterial.dashOffset -= 0.01; // 可以调整动画速度
   mesh.rotation.z += 0.005; // 可以调整旋转速度
   ```

4. **创建其他形状**：修改`geometryPoints`的生成方式，使用其他参数方程

## 参考资源

- [MeshLine GitHub仓库](https://github.com/pmndrs/meshline)
- [Three.js官方文档](https://threejs.org/docs/)
- [参数方程心形曲线公式](https://mathworld.wolfram.com/HeartCurve.html)

## 注意事项

- 该项目需要现代浏览器支持WebGL
- 如果遇到性能问题，可以尝试减少曲线上的点数量或简化背景效果
