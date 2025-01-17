# Three.js 飞机动画演示

这是一个使用 Three.js 制作的 3D 飞机动画演示项目。在这个项目中，你可以看到一架 3D 飞机模型沿着预设的路径飞行。

## 项目特点

- 使用 Three.js 实现 3D 场景
- 包含可交互的飞机模型
- 平滑的飞行动画效果
- 可自定义的飞行路径

## 如何运行

1. 确保已安装 Node.js
2. 在项目目录下运行以下命令：
   ```bash
   npm install    # 安装依赖
   npm run dev    # 启动开发服务器
   ```
3. 在浏览器中打开显示的本地地址（通常是 http://localhost:5173）

## 项目结构

```
airplane/
├── src/               # 源代码目录
│   ├── main.js        # 主程序入口
│   ├── style.css      # 样式文件
│   └── models/        # 3D 模型文件
├── public/            # 静态资源目录
│   └── models/        # 3D 模型文件
└── index.html         # HTML 入口文件
```

## 技术栈

- Vite - 现代前端构建工具
- Three.js - 3D 图形库
- JavaScript - 编程语言
