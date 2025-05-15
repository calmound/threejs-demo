import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
// 修改背景颜色为黑色或深灰色，增强对比度
renderer.setClearColor(0x000000, 1); // 修改为黑色背景
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 设置相机位置
camera.position.set(0, 3, 5);
camera.lookAt(0, 0, 0);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// 添加网格辅助
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

// 控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

const injectCustomShader = (shader) => {
  // 顶点着色器增强
  shader.vertexShader = shader.vertexShader
    .replace(
      "void main() {",
      `
        attribute float a_opacity;
        attribute float a_size;
        attribute float a_scale;
        varying float v_opacity;

        void main() {
          v_opacity = a_opacity;
      `
    )
    .replace("gl_PointSize = size;", "gl_PointSize = a_size * a_scale;");

  // 片元着色器增强
  shader.fragmentShader = shader.fragmentShader
    .replace(
      "void main() {",
      `
        varying float v_opacity;
        void main() {
      `
    )
    .replace(
      "gl_FragColor = vec4(outgoingLight, diffuseColor.a);",
      "gl_FragColor = vec4(outgoingLight, diffuseColor.a * v_opacity);"
    );
};

const createSmoke = () => {
  // 尝试加载纹理并添加错误处理
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(
    "/public/smoke.png",
    () => console.log("纹理加载成功"),
    undefined,
    (err) => console.error("纹理加载失败:", err)
  );

  // 简化材质设置，修改为更鲜明的颜色
  const material = new THREE.PointsMaterial({
    size: 3, // 视图范围大时可适当增大
    color: 0xcccccc, // 白色偏灰色
    map: texture, // 必须是透明PNG的烟雾贴图
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
    // blending: THREE.NormalBlending,
  });

  // 创建一个简单的测试几何体，确保能看到粒子
  const testGeometry = new THREE.BufferGeometry();
  const testPositions = new Float32Array([
    0,
    1,
    0, // 中心点上方
    -1,
    0,
    0, // 左侧
    1,
    0,
    0, // 右侧
    0,
    0,
    1, // 前方
    0,
    0,
    -1, // 后方
  ]);
  testGeometry.setAttribute("position", new THREE.BufferAttribute(testPositions, 3));

  // 添加测试粒子到场景
  const testPoints = new THREE.Points(testGeometry, material);
  scene.add(testPoints);
  console.log("测试粒子已添加到场景");

  // 原始粒子系统
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(0), 3));
  geometry.setAttribute("a_opacity", new THREE.BufferAttribute(new Float32Array(0), 1));
  geometry.setAttribute("a_size", new THREE.BufferAttribute(new Float32Array(0), 1));
  geometry.setAttribute("a_scale", new THREE.BufferAttribute(new Float32Array(0), 1));

  const points = new THREE.Points(geometry, material);
  scene.add(points);
  console.log("动态粒子系统已添加到场景");

  // 存储粒子数据的数组
  const particles = [];

  // 初始化粒子 - 增加数量和初始可见性
  const initParticles = (count = 100) => {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random() * 2, // 从地面开始
        z: Math.random() * 5,
        size: 1, // 增大尺寸
        opacity: 0.1, // 提高不透明度
        scale: 0.2, // 增大初始比例
        speed: {
          x: Math.random(),
          y: Math.random() + 0.2,
          z: Math.random(),
        },
      });
    }
  };

  const addNewParticle = () => {
    particles.push({
      x: (Math.random() - 0.5) * 5,
      y: Math.random() * 2,
      z: (Math.random() - 0.5) * 5,
      size: 1 + Math.random() * 2,
      opacity: 0.7, // 提高不透明度
      scale: 0.2, // 增大初始比例
      speed: {
        x: (Math.random() - 0.5) * 0.05,
        y: 0.05 + Math.random() * 0.1,
        z: (Math.random() - 0.5) * 0.05,
      },
    });
  };

  const updateGeometry = () => {
    const positions = [];
    const opacities = [];
    const sizes = [];
    const scales = [];

    const aliveParticles = particles.filter((p) => p.opacity > 0);

    aliveParticles.forEach((p) => {
      // 更新粒子属性
      p.opacity -= 0.003; // 从0.01减为0.005
      p.scale += 0.005;
      p.x += p.speed.x * 0.2;
      p.y += p.speed.y * 0.2;
      p.z += p.speed.z * 0.2;

      // 收集数据
      positions.push(p.x, p.y, p.z);
      opacities.push(p.opacity);
      sizes.push(p.size);
      scales.push(p.scale);
    });

    // 更新粒子数组，只保留存活的粒子
    particles.length = 0;
    particles.push(...aliveParticles);

    // 调试输出
    if (aliveParticles.length > 0) {
      console.log("活跃粒子数:", aliveParticles.length);
    } else {
      console.log("没有活跃粒子");
    }

    // 更新几何体属性
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute("a_opacity", new THREE.BufferAttribute(new Float32Array(opacities), 1));
    geometry.setAttribute("a_size", new THREE.BufferAttribute(new Float32Array(sizes), 1));
    geometry.setAttribute("a_scale", new THREE.BufferAttribute(new Float32Array(scales), 1));
  };

  // 初始化更多粒子
  initParticles(50); // 增加初始粒子数

  // 修改animate函数，加入粒子更新逻辑
  const animate = () => {
    requestAnimationFrame(animate);

    // 减少添加新粒子的频率，避免性能问题
    if (Math.random() > 0.5) {
      // 每次添加多个粒子
      addNewParticle();
    }

    updateGeometry();
    controls.update();
    renderer.render(scene, camera);
  };
  animate();
};

// 添加窗口调整大小事件处理
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

createSmoke();

// 添加辅助功能，帮助调试
console.log("场景对象:", scene);
