# Three.js Mixamo 动画演示

这个项目展示了如何在 Three.js 中使用来自 Mixamo 的 3D 角色动画。

## Mixamo 简介

[Mixamo](https://www.mixamo.com/) 是 Adobe 旗下的一个免费 3D 角色动画网站，它提供了以下主要功能：

### 1. 免费的角色模型库
- 提供多种高质量的 3D 人物角色模型
- 包含各种风格：写实、卡通、游戏等
- 所有模型都经过骨骼绑定，可以直接使用

### 2. 丰富的动画库
- 超过 2000+ 种预制动画
- 涵盖走路、跑步、跳跃、战斗等各种动作
- 每个动画都可以自定义参数（如强度、速度等）

### 3. 自动绑定功能
- 上传自己的角色模型
- 自动进行骨骼绑定
- 支持自定义绑定调整

### 4. 导出格式支持
- FBX（带动画）
- OBJ（仅模型）
- 支持多种软件兼容性（Unity、Unreal、Blender等）

## 使用步骤

### 从 Mixamo 下载模型
1. 访问 [Mixamo](https://www.mixamo.com/)
2. 登录 Adobe 账号（免费注册）
3. 选择一个角色或上传自己的角色
4. 选择动画并下载为 FBX 格式

### 在项目中使用
1. 将下载的 FBX 文件放入 `public` 目录
2. 使用 Three.js 的 FBXLoader 加载模型
3. 通过 AnimationMixer 控制动画播放

## 项目结构

```
animate/
├── public/
│   └── animate.fbx    # Mixamo 动画模型
├── src/
│   ├── main.js        # Three.js 场景设置和动画控制
│   ├── style.css      # 样式文件
│   └── index.html     # HTML 入口文件
└── package.json       # 项目依赖
```

## 技术栈

- Vite 3 - 前端构建工具
- Three.js - 3D 渲染引擎
- FBXLoader - FBX 模型加载器

## 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 代码示例

主要的动画加载和控制代码：

```javascript
// 加载FBX模型
const loader = new FBXLoader();
let mixer = null;

loader.load('/animate.fbx', (fbx) => {
    fbx.scale.setScalar(1);
    fbx.position.set(0, 0, 0);
    
    // 创建动画混合器
    mixer = new THREE.AnimationMixer(fbx);
    
    // 播放所有动画
    const animations = fbx.animations;
    if (animations && animations.length > 0) {
        const action = mixer.clipAction(animations[0]);
        action.play();
    }
    
    scene.add(fbx);
});
```

## 交互控制

- 左键拖动：旋转视角
- 右键拖动：平移视角
- 滚轮：缩放视角

## 注意事项

1. Mixamo 模型下载时注意选择：
   - Format: FBX Binary
   - Skin: With Skin
   - Frames per Second: 30 (推荐)
   - Keyframe Reduction: None (保证动画质量)

2. 模型优化建议：
   - 下载时可以适当降低多边形数量
   - 选择合适的帧率以平衡性能和流畅度
   - 必要时可以压缩贴图大小

## 更多资源

- [Mixamo 官方文档](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html)
- [Three.js 文档](https://threejs.org/docs/)
- [FBX 格式规范](https://code.blender.org/2013/08/fbx-binary-file-format-specification/)

## 许可证

本项目使用 MIT 许可证。但请注意，Mixamo 的内容使用需遵循 Adobe 的使用条款。
