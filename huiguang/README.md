# Three.js 行星演示项目

这是一个使用Three.js创建的3D行星演示项目，展示了一个带有光晕效果的行星及其周围的粒子系统。

## 功能特点

- 3D行星模型，使用真实的纹理贴图
- 光晕效果，使用自定义着色器实现
- 粒子系统，创建星空背景
- 响应式设计，适应不同屏幕尺寸

## 项目结构

```
huiguang/
├── index.html          # 主HTML文件
├── src/
│   ├── main.js         # 主JavaScript文件，包含Three.js初始化和动画逻辑
│   ├── style.css       # 样式文件
│   └── shaders/        # 着色器文件目录
│       ├── vertexShader.glsl   # 顶点着色器
│       └── fragmentShader.glsl # 片段着色器
├── public/             # 静态资源目录
└── package.json        # 项目依赖配置
```

## 技术栈

- Three.js: 用于创建和显示3D内容
- Vite: 用于构建和开发

## 如何使用

1. 安装依赖：
   ```
   npm install
   ```

2. 启动开发服务器：
   ```
   npm run dev
   ```

3. 构建生产版本：
   ```
   npm run build
   ```

## 自定义

### 修改行星外观

可以在`main.js`文件中修改行星材质的参数：

```javascript
var mat = new THREE.MeshPhongMaterial({
  color: 0xE3D1AF,
  emissive: 0x000000,
  flatShading: false,
  // 其他参数...
});
```

### 修改光晕效果

可以在`src/shaders/fragmentShader.glsl`文件中修改光晕的颜色和强度：

```glsl
float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 0.5)), 4.0); 
gl_FragColor = vec4(0.89, 0.82, 0.69, 1.0) * intensity;
```

### 修改粒子系统

可以在`main.js`文件中调整粒子的数量、大小和分布：

```javascript
for (var i = 0; i < 500; i++) {
  var mesh = new THREE.Mesh(geometry, material);
  // 配置粒子...
  particle.add(mesh);
}
```

## 注意事项

- 确保WebGL在您的浏览器中可用
- 对于较低性能的设备，可能需要减少粒子数量以提高性能
