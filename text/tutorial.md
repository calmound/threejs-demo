# 现代 3D 粒子文本动画教程

这篇文章带大家看一个现代感十足的 3D 动画：无数发光的粒子在空间中汇集、旋转，最终优雅地组成你想要的文字。使用 Three.js 和 GSAP 创建一个现代化的 3D 粒子文本动画。

我们，先来看下效果

## 准备 HTML 结构

首先，需要创建项目的基本 HTML 文件 `index.html`。该文件将作为整个应用的入口，负责引入必要的库、定义页面结构和基础样式。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Modern 3D Particle Text Animation</title>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0"
    />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
    />
    <style>
      body {
        margin: 0;
        background-color: #000000;
        color: #fff;
        font-family: "Source Code Pro", monospace;
        font-size: 16px;
        line-height: 1.5;
        overflow: hidden;
      }
      #container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      #coverBlack {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #000000;
        z-index: 100;
      }
    </style>
  </head>
  <body>
    <div id="container"></div>
    <div id="coverBlack"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js"></script>
    <script src="index.js"></script>
  </body>
</html>
```

- `<link>` 标签用于引入 Font Awesome 字体图标库，后续将用其图标作为粒子的纹理。
- `<style>` 块定义了基础页面样式，包括黑色背景、全屏容器以及一个用于实现淡入淡出效果的黑色遮罩层。
- `<body>` 内部包含两个 `div` 元素：`#container` 用于承载 Three.js 的渲染画布，`#coverBlack` 是一个覆盖整个页面的黑色遮罩层，用于在动画开始和结束时实现平滑的过渡效果。
- `<script>` 标签引入了项目所需的两个核心第三方库：[Three.js](https://threejs.org/docs/)（用于 3D 渲染）和 [GSAP (GreenSock Animation Platform)](https://greensock.com/docs/)（用于实现复杂的动画效果）。
- 最后，引入了我们自己的 JavaScript 文件 `index.js`，项目的核心逻辑将在此文件中编写。

## 创建 JavaScript 入口文件

接下来，创建 `index.js` 文件。这是项目所有交互和动画逻辑的存放处。

```js
/**
 * 使用 Three.js 和 GSAP 的现代 3D 粒子文本动画
 * 从 Yausunobu Ikeda 的原始演示重构而来
 */

// 创建纹理加载器实例
const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = "anonymous";
```

- `THREE.TextureLoader` 是 Three.js 提供的一个工具类，用于加载纹理。在这里，我们创建一个全局实例，以便在应用中复用。
- `crossOrigin = "anonymous"` 设置允许跨域加载纹理资源。

## 搭建基础 3D 视图

为了更好地组织代码，我们首先创建一个 `BasicView` 类。这个类将封装一个标准 Three.js 应用所需的基本组件，包括场景、相机和渲染器，并处理窗口尺寸变化的自适应。

```js
// ... existing code ...
textureLoader.crossOrigin = "anonymous";

/**
 * BasicView - 现代 Three.js 设置类
 * 提供场景、相机、渲染器和视口的简单模板
 */
class BasicView {
  constructor() {
    this.containerElement =
      document.getElementById("container") || document.body;
    this.scene = new THREE.Scene();

    // 设置相机
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      200000
    );
    this.camera.position.z = 5000;

    // 使用现代设置初始化渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: window.devicePixelRatio === 1.0,
      alpha: true,
    });
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.containerElement.appendChild(this.renderer.domElement);

    // 绑定 resize 事件处理器
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener("resize", this.handleResize, false);
  }

  /**
   * 窗口大小调整事件处理器
   */
  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * 启动渲染循环
   */
  startRendering() {
    this.update();
  }

  /**
   * 由 requestAnimationFrame 调用的动画循环方法
   */
  update() {
    requestAnimationFrame(() => this.update());
    this.onTick();
    this.render();
  }

  /**
   * 渲染场景
   */
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * 每帧调用 - 在子类中覆盖
   */
  onTick() {}
}
```

- `constructor`: 初始化场景 (`THREE.Scene`)、透视相机 (`THREE.PerspectiveCamera`) 和 WebGL 渲染器 (`THREE.WebGLRenderer`)。
- `this.scene`: 场景是所有 3D 对象的容器。
- `this.camera`: 相机决定了我们观察场景的视角。`PerspectiveCamera` 模拟人眼视觉，参数分别定义了视野角度、宽高比、近裁剪面和远裁剪面。
- `this.renderer`: 渲染器负责将相机观察到的场景内容绘制到 HTML 的 `<canvas>` 元素上。`alpha: true` 允许背景透明，`setPixelRatio` 用于在高分屏上获得更清晰的渲染效果。
- `handleResize`: 这是一个事件处理器，当浏览器窗口大小改变时，它会更新相机的宽高比和渲染器的尺寸，以确保场景正确地填充整个窗口。
- `startRendering` 和 `update`: 这两个方法启动并维持了一个渲染循环。`requestAnimationFrame` 会在浏览器下一次重绘前调用 `update` 函数，从而创建出流畅的动画效果。
- `onTick`: 这是一个空方法，设计为在子类中被重写。它在每一帧渲染前被调用，用于更新动画状态。

## 定义字体与图标常量

在创建粒子文本之前，需要定义将要使用的字体名称和一组将作为粒子纹理的 Font Awesome 图标。

```js
// ... existing code ...
  onTick() {}
}

/**
 * 字体和图标配置
 */
const FONT_NAME = "Source Code Pro";
const FONT_AWESOME_ICONS = [
  "\uf001",
  "\uf002",
  "\uf003",
  "\uf004",
  "\uf005",
  "\uf006",
  "\uf007",
  "\uf008",
  "\uf009",
  "\uf00a",
  "\uf00b",
  "\uf00c",
  "\uf00d",
  "\uf00e",
  "\uf00f",
  "\uf010",
];
```

- `FONT_NAME`: 指定了用于生成文本形状的字体。
- `FONT_AWESOME_ICONS`: 这是一个包含多个 Font Awesome 图标 Unicode 字符的数组。这些图标将被绘制到 Canvas 上，并用作粒子雪碧图的纹理。

## 实现应用主逻辑

现在，创建 `ParticleTextDemo` 类，作为应用的入口点。它的主要职责是确保在所有必要的字体资源加载完成后，再初始化我们的 3D 世界。

```js
// ... existing code ...
  "\uf010",
];

/**
 * 现代粒子文本动画演示
 */
class ParticleTextDemo {
  constructor() {
    // 等待字体加载完毕后再初始化
    this.waitForFonts().then(() => {
      new ParticleTextWorld();
    });
  }

  /**
   * 使用现代字体加载 API 等待字体加载
   */
  async waitForFonts() {
    try {
      // 检查字体是否已加载
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // 对 Font Awesome 进行额外检查
      const testElement = document.createElement("span");
      testElement.style.fontFamily = "FontAwesome";
      testElement.style.fontSize = "16px";
      testElement.innerHTML = "\uf001";
      testElement.style.position = "absolute";
      testElement.style.left = "-9999px";
      document.body.appendChild(testElement);

      // 等待一小段时间以便字体加载
      await new Promise((resolve) => setTimeout(resolve, 100));

      document.body.removeChild(testElement);
    } catch (error) {
      console.warn("Font loading check failed, proceeding anyway:", error);
    }
  }
}
```

- `constructor`: 在实例化时，调用 `waitForFonts` 方法。这是一个异步操作，使用 `.then()` 来确保只有在字体加载成功后，才会创建 `ParticleTextWorld` 的实例。
- `waitForFonts`: 这个异步方法 (`async/await`) 使用 `document.fonts.ready` API 来等待网页字体加载完成。它还包含一个额外的检查，通过创建一个临时的、屏幕外的 `<span>` 元素来确认 Font Awesome 字体是否已成功应用。

## 构建粒子世界

`ParticleTextWorld` 类是动画的核心。它继承自 `BasicView`，并在此基础上添加所有与粒子文本动画相关的对象和逻辑。

```js
// ... existing code ...
      console.warn("Font loading check failed, proceeding anyway:", error);
    }
  }
}
/**
 * 3D 粒子文本世界 - 主动画类
 */
class ParticleTextWorld extends BasicView {
  constructor() {
    super();

    // 配置
    this.CANVAS_W = 160;
    this.CANVAS_H = 40;
    this.WORD_LIST = ["Three.js"];
    this.matrixLength = 4; // 为简化起见减少
    this.particleList = [];
    this.hue = 0.6; // 颜色色相 0.0-1.0
    this.HELPER_ZERO = new THREE.Vector3(0, 0, 0);

    this.setup();
    this.createLogo();
    this.startRendering();
  }
  /**
   * 设置 3D 场景
   */
  setup() {
    // 相机设置
    this.camera.far = 100000;
    this.camera.near = 1;
    this.camera.position.z = 5000;
    this.camera.lookAt(this.HELPER_ZERO);

    // 创建背景
    const plane = new THREE.PlaneGeometry(50000, 50000);

    // 创建一个简单的渐变背景，而不是加载外部图像
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // 创建渐变
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(0.5, "#16213e");
    gradient.addColorStop(1, "#0f0f23");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    const bgTexture = new THREE.CanvasTexture(canvas);
    const bgMaterial = new THREE.MeshBasicMaterial({ map: bgTexture });

    this.bg = new THREE.Mesh(plane, bgMaterial);
    this.bg.position.z = -10000;
    this.scene.add(this.bg);

    // 添加光照
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 1).normalize();
    this.scene.add(light);

    // 用于粒子运动的容器
    this.wrap = new THREE.Object3D();
    this.scene.add(this.wrap);
    // 使用现代 Canvas API 生成粒子纹理图集
    const SIZE = 256;
    const atlasCanvas = document.createElement("canvas");
    const atlasSize = SIZE * this.matrixLength;
    atlasCanvas.width = atlasSize;
    atlasCanvas.height = atlasSize;
    const atlasCtx = atlasCanvas.getContext("2d");

    // 设置字体属性
    atlasCtx.font = "200px FontAwesome";
    atlasCtx.fillStyle = "#FFFFFF";
    atlasCtx.textAlign = "center";
    atlasCtx.textBaseline = "middle";

    // 在网格中绘制 Font Awesome 图标
    for (let i = 0; i < this.matrixLength * this.matrixLength; i++) {
      const iconIndex = i % FONT_AWESOME_ICONS.length;
      const char = FONT_AWESOME_ICONS[iconIndex];
      const x = (i % this.matrixLength) * SIZE + SIZE / 2;
      const y = Math.floor(i / this.matrixLength) * SIZE + SIZE / 2;
      atlasCtx.fillText(char, x, y);
    }

    // 从 canvas 创建纹理
    const texture = new THREE.CanvasTexture(atlasCanvas);
    texture.needsUpdate = true;
    // 创建粒子
    const ux = 1 / this.matrixLength;
    const uy = 1 / this.matrixLength;
    this.particleList = [];

    for (let i = 0; i < this.CANVAS_W; i++) {
      for (let j = 0; j < this.CANVAS_H; j++) {
        const ox = Math.floor(this.matrixLength * Math.random());
        const oy = Math.floor(this.matrixLength * Math.random());

        const geometry = new THREE.PlaneGeometry(40, 40);
        this.changeUVs(geometry, ux, uy, ox, oy);

        const material = new THREE.MeshLambertMaterial({
          color: 0xffffff,
          map: texture,
          transparent: true,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        });

        const particle = new THREE.Mesh(geometry, material);
        this.wrap.add(particle);
        this.particleList.push(particle);
      }
    }

    this.createParticleCloud();
  }
}
```

- **背景**: 通过在 2D Canvas 上绘制径向渐变，并将其作为纹理 (`THREE.CanvasTexture`) 应用到一个巨大的平面 (`THREE.PlaneGeometry`) 上，创建了一个深邃的太空背景。
- **光照**: 添加了一盏平行光 (`THREE.DirectionalLight`)，为粒子提供照明，使其具有立体感。
- **粒子容器**
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending,
  });

          const particle = new THREE.Mesh(geometry, material);
          this.wrap.add(particle);
          this.particleList.push(particle);
        }
      }

      this.createParticleCloud();

  }
  }

````

-   **背景**: 通过在 2D Canvas 上绘制径向渐变，并将其作为纹理 (`THREE.CanvasTexture`) 应用到一个巨大的平面 (`THREE.PlaneGeometry`) 上，创建了一个深邃的太空背景。
-   **光照**: 添加了一盏平行光 (`THREE.DirectionalLight`)，为粒子提供照明，使其具有立体感。
-   **粒子容器**: 创建了一个 `THREE.Object3D` 实例 `this.wrap`，它将作为所有文本形态粒子的容器。对这个容器进行变换（如移动、旋转）会影响到其中的所有粒子，便于整体控制。
-   **粒子纹理图集**:
    -   动态创建一个 Canvas 元素 `atlasCanvas`。
    -   将 `FONT_AWESOME_ICONS` 数组中的图标以网格形式绘制到这个 Canvas 上，形成一个纹理图集（Texture Atlas）。
    -   将此 Canvas 转换为 Three.js 纹理，供所有粒子共享。这种方法比为每个粒子加载单独的图片性能更高。
-   **创建粒子**:
    -   循环创建大量的粒子。每个粒子都是一个小的平面网格 (`THREE.Mesh`)。
    -   `changeUVs` 方法（稍后定义）被调用，用于修改每个粒子平面的 UV 坐标，使其只显示纹理图集中的一个图标。
    -   粒子的材质 `THREE.MeshLambertMaterial` 设置为透明，并使用 `AdditiveBlending`（加法混合），这使得粒子重叠时颜色会变亮，产生发光效果。
    -   所有创建的粒子都被添加到一个数组 `this.particleList` 中以便后续访问，并作为子对象添加到 `this.wrap` 容器中。
-   最后调用 `createParticleCloud()` 来添加背景的粒子效果。

## 创建背景粒子云

为了增强场景的深度感和氛围，我们添加一个由大量微小粒子组成的背景云。

```js
// ... existing code ...
    this.createParticleCloud();
  }
  /**
   * Create background particle cloud
   */
  createParticleCloud() {
    const geometry = new THREE.BufferGeometry();
    const numParticles = 10000; // Reduced for simplicity
    const SIZE = 10000;
    const positions = new Float32Array(numParticles * 3);

    for (let i = 0; i < numParticles; i++) {
      positions[i * 3] = SIZE * (Math.random() - 0.5);
      positions[i * 3 + 1] = SIZE * (Math.random() - 0.5);
      positions[i * 3 + 2] = SIZE * (Math.random() - 0.5);
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Create simple particle texture instead of loading external image
    const particleCanvas = document.createElement("canvas");
    particleCanvas.width = 64;
    particleCanvas.height = 64;
    const particleCtx = particleCanvas.getContext("2d");

    // Create radial gradient for particle
    const gradient = particleCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    particleCtx.fillStyle = gradient;
    particleCtx.fillRect(0, 0, 64, 64);

    const particleTexture = new THREE.CanvasTexture(particleCanvas);

    const material = new THREE.PointsMaterial({
      size: 30,
      color: 0x444444,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthTest: false,
      map: particleTexture,
    });

    const mesh = new THREE.Points(geometry, material);
    mesh.position.set(0, 0, 0);
    this.scene.add(mesh);
  }
}
````

- 使用 `THREE.BufferGeometry` 来高效地存储大量粒子的位置数据。`positions` 数组存放了每个粒子在三维空间中的 x, y, z 坐标。
- 与背景平面类似，这里也通过在 2D Canvas 上绘制一个中心亮、边缘透明的径向渐变来创建单个粒子的纹理。
- 使用 `THREE.Points` 和 `THREE.PointsMaterial` 来创建粒子系统。这种方式专门为渲染大量点状对象优化，性能远高于使用大量 `THREE.Mesh`。
- `depthTest: false` 禁用了深度测试，可以避免粒子之间因为排序问题而产生的闪烁。

## 实现核心文本动画

`createLogo` 方法是整个动画的核心。它负责将文字渲染到不可见的 Canvas 上，分析像素数据，然后使用 GSAP 驱动粒子从随机位置移动到文字的形状上。

```js
// ... existing code ...
    this.scene.add(mesh);
  }
  /**
   * Create logo animation with particles
   */
  createLogo() {
    // Create text canvas
    const canvas = document.createElement("canvas");
    canvas.width = this.CANVAS_W;
    canvas.height = this.CANVAS_H;
    const ctx = canvas.getContext("2d");

    // Draw text - always "Three.js"
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `30px ${FONT_NAME}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.WORD_LIST[0], this.CANVAS_W / 2, this.CANVAS_H / 2);
    // Create GSAP timeline - single animation, no loop
    const timeline = gsap.timeline({
      onComplete: () => {
        // Animation complete - show text for longer time
        gsap.to("#coverBlack", {
          duration: 1.0,
          opacity: 1.0,
          delay: 5.0, // Show text for 5 seconds before fade
          onComplete: () => {
            // Restart the animation after a pause
            setTimeout(() => {
              this.createLogo();
            }, 2000);
          },
        });
      },
    });

    // Hide all particles initially
    for (let i = 0; i < this.particleList.length; i++) {
      this.particleList[i].visible = false;
    }

    // Analyze pixel data to determine text shape
    const pixelColors = ctx.getImageData(
      0,
      0,
      this.CANVAS_W,
      this.CANVAS_H
    ).data;
    const existDotList = [];
    let existDotCount = 0;

    for (let i = 0; i < this.CANVAS_W; i++) {
      existDotList[i] = [];
      for (let j = 0; j < this.CANVAS_H; j++) {
        // Check if pixel is transparent (text area)
        const flag = pixelColors[(i + j * this.CANVAS_W) * 4 + 3] === 0;
        existDotList[i][j] = flag;
        if (flag === true) existDotCount++;
      }
    }
    // Create particle motion animation
    let cnt = 0;
    const max = this.CANVAS_W * this.CANVAS_H;

    for (let i = 0; i < this.CANVAS_W; i++) {
      for (let j = 0; j < this.CANVAS_H; j++) {
        // Skip transparent pixels
        if (existDotList[i][j] === true) continue;

        const particle = this.particleList[cnt];

        // Set particle color with HSL
        particle.material.color.setHSL(
          this.hue + ((i * canvas.height) / max - 0.5) * 0.2,
          0.5,
          0.6 + 0.4 * Math.random()
        );

        this.wrap.add(particle);

        // Define target and start positions
        const targetPos = {
          x: (i - canvas.width / 2) * 30,
          y: (canvas.height / 2 - j) * 30,
          z: 0,
        };

        const startPos = {
          x: 2000 * (Math.random() - 0.5) - 500,
          y: 1000 * (Math.random() - 0.5),
          z: 10000,
        };

        // Set initial position and rotation
        particle.position.set(startPos.x, startPos.y, startPos.z);
        particle.rotation.z = 10 * Math.PI * (Math.random() - 0.5);
        particle.visible = false;

        // Calculate delay for staggered animation - longer delays
        const delay = (cnt / 1600) * 4.0 + 2.0 * Math.random();

        // Rotation animation - longer duration
        timeline.to(
          particle.rotation,
          {
            duration: 8.0,
            z: 0,
            ease: "power2.inOut",
          },
          delay
        );

        // Show particle
        timeline.set(particle, { visible: true }, delay);

        // Simple position animation - longer duration
        timeline.to(
          particle.position,
          {
            duration: 10.0,
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z,
            ease: "expo.inOut",
          },
          delay
        );

        cnt++;
      }
    }
    // Animate particle container
    this.wrap.position.z = -5000;
    timeline.to(
      this.wrap.position,
      {
        duration: 18.0,
        z: 6000,
        ease: "power4.in",
      },
      0
    );

    // Simple camera motion - only one variation
    timeline.set(this.camera.position, { x: 200, y: -200, z: 1000 }, 0);
    timeline.to(
      this.camera.position,
      {
        duration: 20.0,
        x: 0,
        y: 0,
        z: 5000,
        ease: "power2.inOut",
      },
      0
    );
    // Fade in from black cover
    timeline.to(
      "#coverBlack",
      {
        duration: 1.0,
        opacity: 0.0,
      },
      0
    );

    // Simple time scaling - normal speed only
    timeline.timeScale(1.0);

    // Update background color
    this.bg.material.color.setHSL(this.hue, 1.0, 0.5);

    // Cycle hue
    this.hue += 0.2;
    if (this.hue >= 1.0) {
      this.hue = 0.0;
    }
  }
}
```

- **文本到像素**:
  - 在内存中创建一个 2D Canvas，并将目标文字（"Three.js"）绘制上去。
  - 使用 `ctx.getImageData()` 获取该 Canvas 的像素数据。`pixelColors` 是一个一维数组，包含了每个像素的 R, G, B, A (透明度) 值。
  - 遍历像素数据，通过检查每个像素的 Alpha (A) 通道值，判断该位置是否有文字。`existDotList` 记录了哪些像素点是构成文字的。
- **GSAP 时间线**:
  - `gsap.timeline()` 创建一个动画时间线，用于编排一系列复杂的、同步的动画。
  - `onComplete` 回调函数定义了当整个动画序列播放完毕后要执行的操作：等待 5 秒，然后用黑色遮罩层淡出，最后在短暂延迟后重新调用 `createLogo`，实现动画的循环播放。
- **粒子动画**:
  - 遍历 `existDotList` 中标记为有文字的像素点。
  - 为每个点分配一个之前创建的粒子。
  - `particle.material.color.setHSL`: 使用 HSL 颜色模型为每个粒子设置一个基于其位置的、略有变化的颜色，创造出彩虹般的效果。
  - 定义粒子的起始位置 (`startPos`，随机分布在远处) 和目标位置 (`targetPos`，根据其在文字中的像素位置计算得出)。
  - 使用 `timeline.to()` 将粒子从起始位置和随机旋转状态，动画到目标位置和零旋转状态。`delay` 参数使粒子们错开出现，形成汇集的效果。`ease` 属性控制了动画的缓动曲线，使其看起来更自然。
- **全局动画**:
  - 除了单个粒子的动画，时间线还控制了相机的位置和粒子容器 `this.wrap` 的 Z 轴位置，创造出镜头推近和粒子云整体移动的宏观动态。
  - `timeline.to("#coverBlack", ...)` 在动画开始时，将黑色遮罩层的透明度从 1 动画到 0，实现平滑的淡入效果。
- **颜色循环**:
  - 每次 `createLogo` 被调用时，都会更新背景颜色和粒子的基础色相 (`this.hue`)，使得每次循环的动画颜色都不同。

## 编写每帧更新逻辑与工具函数

最后，需要实现 `onTick` 方法来处理每一帧的更新，以及 `changeUVs` 工具函数。同时，添加一个 `load` 事件监听器来启动整个应用。

```js
// ... existing code ...
    if (this.hue >= 1.0) {
      this.hue = 0.0;
    }
  }
  /**
   * Called every frame
   */
  onTick() {
    super.onTick();
    this.camera.lookAt(this.HELPER_ZERO);

    // Position background opposite to camera
    const vec = this.camera.position.clone();
    vec.negate();
    vec.normalize();
    vec.multiplyScalar(10000);
    this.bg.position.copy(vec);
    this.bg.lookAt(this.camera.position);
  }

  /**
   * Change UV coordinates of geometry for texture atlas
   * @param {THREE.PlaneGeometry} geometry
   * @param {number} unitX
   * @param {number} unitY
   * @param {number} offsetX
   * @param {number} offsetY
   */
  changeUVs(geometry, unitX, unitY, offsetX, offsetY) {
    const uvAttribute = geometry.attributes.uv;
    if (uvAttribute) {
      const uvArray = uvAttribute.array;
      for (let i = 0; i < uvArray.length; i += 2) {
        uvArray[i] = (uvArray[i] + offsetX) * unitX;
        uvArray[i + 1] = (uvArray[i + 1] + offsetY) * unitY;
      }
      uvAttribute.needsUpdate = true;
    }
  }
}

// Initialize the demo when page loads
window.addEventListener("load", () => {
  new ParticleTextDemo();
});
```

- `onTick`:
  - `super.onTick()`: 调用父类的 `onTick`（虽然父类是空的，但这是个好习惯）。
  - `this.camera.lookAt(this.HELPER_ZERO)`: 确保相机在每一帧都朝向场景的原点。
  - 背景板 (`this.bg`) 的位置被动态更新，使其始终位于相机的正后方，并朝向相机。这创造了一种无限深远的背景效果，无论相机如何移动，背景都看起来是静止的。
- `changeUVs`:
  - 这是一个工具函数，用于修改一个几何体 (`THREE.PlaneGeometry`) 的 UV 坐标。
  - UV 坐标决定了纹理如何映射到几何体表面。通过计算偏移量和缩放比例，这个函数可以精确地让每个粒子平面只显示纹理图集中的一小块（即一个图标）。
- `window.addEventListener("load", ...)`:
  - 这是整个应用的启动器。它监听窗口的 `load` 事件，确保在所有页面资源（包括图片、CSS 等）都加载完毕后，才开始执行 JavaScript，实例化 `ParticleTextDemo`，从而启动动画。
