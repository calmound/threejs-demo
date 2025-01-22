import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { gsap } from "gsap";
import "./style.css";

// ----
// 初始化场景
// ----

// 创建渲染器、场景和相机
const renderer = new THREE.WebGLRenderer({ alpha: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 100);
const controls = new OrbitControls(camera, renderer.domElement);

// 监听窗口大小变化，调整渲染尺寸
window.addEventListener("resize", () => {
  const { clientWidth, clientHeight } = renderer.domElement;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(clientWidth, clientHeight, false);
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
});

// 将渲染器添加到页面并开始渲染循环
document.body.prepend(renderer.domElement);
window.dispatchEvent(new Event("resize"));

// 设置旋转速度（弧度/帧）
const rotationSpeed = 0.015;

renderer.setAnimationLoop((t) => {
  // 更新网格组的旋转
  g.rotation.y += rotationSpeed;
  // 渲染场景
  renderer.render(scene, camera);
  controls.update();
});

// ----
// 主要场景设置
// ----

// 定义网格尺寸和图片数量
const W = 10,
  H = 10,
  SW = W * 20,
  SH = H * 20;

// 定义图片URL数组
const IMG_URLS = [
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=60",
  "https://images.unsplash.com/flagged/photo-1575494539155-6af0f84aa076?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80",
];

// 设置相机位置
camera.position.set(0, 0, 8);

// 添加聚光灯
for (const { color, intensity, x, y, z } of [
  { color: "white", intensity: 1, x: -W, y: 0, z: 0 },
  { color: "white", intensity: 1, x: W, y: 0, z: 0 },
]) {
  const L = new THREE.SpotLight(color, intensity, W, Math.PI / 2, 0, 0);
  L.position.set(x, y, z);
  scene.add(L);
}

// 创建顶点网格
const vs = [];
for (let i = 0, I = SH; i < I; ++i) {
  vs[i] = [];
  const nY = i / (I - 1);
  for (let j = 0, J = SW; j < J; ++j) {
    const nX = j / (J - 1);
    vs[i][j] = {
      uv: [nX, nY],
      xyz: [
        (nX - 0.5) * W,
        (nY - 0.5) * H,
        ((i + 1) % 2) * (j % 2) * 0.5 - 0.25,
      ],
    };
  }
}

// 创建两组几何体
const geoms = [];
for (let k = 0; k <= 1; ++k) {
  const geom = new THREE.BufferGeometry();
  const N = ((SW - k) >> 1) * (SH - 1);
  const pos = new Float32Array(N * 3 * 6); // 六个(x,y,z)坐标
  const uv = new Float32Array(N * 2 * 6); // 六个(u,v)纹理坐标
  let n = 0;
  for (let i = 0, I = SH - 1; i < I; ++i) {
    for (let j = k, J = SW - 1; j < J; j += 2) {
      let v = vs[i][j];
      pos.set(v.xyz, n * 3);
      uv.set(v.uv, n * 2);
      ++n;
      v = vs[i][j + 1];
      pos.set(v.xyz, n * 3);
      uv.set(v.uv, n * 2);
      ++n;
      v = vs[i + 1][j];
      pos.set(v.xyz, n * 3);
      uv.set(v.uv, n * 2);
      ++n;
      v = vs[i][j + 1];
      pos.set(v.xyz, n * 3);
      uv.set(v.uv, n * 2);
      ++n;
      v = vs[i + 1][j + 1];
      pos.set(v.xyz, n * 3);
      uv.set(v.uv, n * 2);
      ++n;
      v = vs[i + 1][j];
      pos.set(v.xyz, n * 3);
      uv.set(v.uv, n * 2);
      ++n;
    }
  }
  geom.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geom.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geom.computeVertexNormals();
  geoms.push(geom);
}

// 创建网格模型
const g = new THREE.Group();
for (const [i, geom] of geoms.entries()) {
  const map = new THREE.TextureLoader().load(IMG_URLS[i]);
  const mat = new THREE.MeshLambertMaterial({ map, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geoms[i], mat);
  g.add(mesh);
}
scene.add(g);
