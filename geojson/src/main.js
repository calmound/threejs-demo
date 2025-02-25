import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a); // 深色背景

// 添加环境光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// 添加平行光
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// 添加点光源
const pointLight = new THREE.PointLight(0x00ffff, 0.5);
pointLight.position.set(0, 0, 30);
scene.add(pointLight);

// 创建相机
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, -20, 30);
camera.lookAt(0, 0, 0);

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 创建CSS2D渲染器（用于显示文字）
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0px";
labelRenderer.domElement.style.pointerEvents = "none";
document.body.appendChild(labelRenderer.domElement);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);

// 创建材质
const materials = {
  top: new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.2,
    roughness: 0.1,
    transmission: 0.9, // 透光度
    thickness: 0.5, // 厚度
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    envMapIntensity: 1,
    clearcoat: 1.0, // 清漆层
    clearcoatRoughness: 0.1,
  }),
  side: new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.2,
    roughness: 0.1,
    transmission: 0.9,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
  }),
  line: new THREE.LineBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.5,
  }),
};

// 坐标转换函数
function convertCoordinates(coord, center) {
  const [lon, lat] = coord;
  const [centerLon, centerLat] = center;

  const scale = 15;
  const x = (lon - centerLon) * scale;
  const y = (lat - centerLat) * scale;

  return [x, y];
}

// 计算多边形中心点
function calculatePolygonCenter(points) {
  if (points.length === 0) return { x: 0, y: 0 };

  let sumX = 0,
    sumY = 0;
  points.forEach((p) => {
    sumX += p.x;
    sumY += p.y;
  });

  return {
    x: sumX / points.length,
    y: sumY / points.length,
  };
}

// 创建文字标签
function createLabel(name, position) {
  const div = document.createElement("div");
  div.className = "label";
  div.textContent = name;
  div.style.color = "#00ffff";
  div.style.padding = "4px 8px";
  div.style.fontSize = "12px";
  div.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  div.style.borderRadius = "4px";
  div.style.border = "1px solid #00ffff";
  div.style.whiteSpace = "nowrap"; // 防止文字换行
  div.style.pointerEvents = "none"; // 允许鼠标事件穿透
  div.style.textAlign = "center"; // 文字居中
  div.style.transform = "translate(-50%, -50%)"; // 确保标签中心点对齐
  div.style.position = "absolute"; // 使用绝对定位

  const label = new CSS2DObject(div);
  label.position.set(position.x, position.y, position.z);

  // 添加更新函数
  label.update = function () {
    // 获取当前相机距离
    const distance = camera.position.distanceTo(
      new THREE.Vector3(position.x, position.y, position.z)
    );

    // 根据距离调整标签大小
    const scale = Math.max(0.5, Math.min(1, 30 / distance));
    div.style.transform = `translate(-50%, -50%) scale(${scale})`; // 合并transform属性
  };

  return label;
}

// 创建3D区域
function createExtrudedShape(points, height) {
  const shape = new THREE.Shape();
  points.forEach((point, i) => {
    if (i === 0) {
      shape.moveTo(point.x, point.y);
    } else {
      shape.lineTo(point.x, point.y);
    }
  });

  const extrudeSettings = {
    depth: height,
    bevelEnabled: true,
    bevelThickness: 0.3,
    bevelSize: 0.2,
    bevelOffset: 0,
    bevelSegments: 5,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const mesh = new THREE.Mesh(geometry, materials.top);

  // 添加发光效果
  const edges = new THREE.EdgesGeometry(geometry);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
    })
  );
  mesh.add(line);

  return mesh;
}

// 加载地图数据
async function loadMapData() {
  const response = await fetch("/map.json");
  const mapData = await response.json();

  const centerCoord = [116.4074, 39.9042];
  const labels = []; // 存储所有标签

  mapData.features.forEach((feature, index) => {
    if (feature.geometry.type === "MultiPolygon") {
      const allPoints = [];
      let maxHeight = 0;

      feature.geometry.coordinates.forEach((polygon) => {
        polygon.forEach((ring) => {
          const points = [];
          ring.forEach((coord) => {
            const [x, y] = convertCoordinates(coord, centerCoord);
            points.push(new THREE.Vector3(x, y, 0));
          });

          allPoints.push(...points);

          const height = 1 + Math.random() * 0.5;
          maxHeight = Math.max(maxHeight, height);
          const extrudedMesh = createExtrudedShape(points, height);
          scene.add(extrudedMesh);

          // 创建边框
          const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            ...points,
            points[0],
          ]);
          const line = new THREE.Line(lineGeometry, materials.line);
          line.position.setZ(height);
          scene.add(line);

          // 创建垂直边框
          points.forEach((point, i) => {
            const nextPoint = points[(i + 1) % points.length];
            const verticalLineGeometry =
              new THREE.BufferGeometry().setFromPoints([
                point,
                new THREE.Vector3(point.x, point.y, height),
              ]);
            const verticalLine = new THREE.Line(
              verticalLineGeometry,
              materials.line
            );
            scene.add(verticalLine);
          });
        });
      });

      // 创建标签
      const center = calculatePolygonCenter(allPoints);
      const label = createLabel(feature.properties.name, {
        x: center.x,
        y: center.y,
        z: maxHeight + 0.5,
      });
      labels.push(label); // 将标签添加到数组中
      scene.add(label);
    }
  });

  // 修改动画循环函数
  function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // 更新所有标签
    labels.forEach((label) => label.update());

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }

  animate();
}

// 加载地图
loadMapData();

// 窗口大小调整
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});
