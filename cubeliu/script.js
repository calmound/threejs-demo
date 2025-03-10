import * as THREE from "three";
import gsap from "gsap";

// 全局变量
let ww = window.innerWidth;
let wh = window.innerHeight;

// 鼠标状态
const mouse = {
  position: new THREE.Vector2(ww * 0.5, wh * 0.5),
  ratio: new THREE.Vector2(0, 0),
  target: new THREE.Vector2(ww * 0.5, wh * 0.5),
};

// 纹理参数
const textureParams = {
  offsetX: 0,
  offsetY: 0,
  repeatX: 10,
  repeatY: 4,
};

// 相机抖动参数
const cameraShake = {
  x: 0,
  y: 0,
};

// 创建场景
const scene = new THREE.Scene();

// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(ww, wh);
document.body.appendChild(renderer.domElement);

// 创建相机
const camera = new THREE.PerspectiveCamera(15, ww / wh, 0.01, 1000);
camera.rotation.y = Math.PI;
camera.position.z = 0.35;

// 创建曲线
const points = [];
for (let i = 0; i < 5; i++) {
  points.push(new THREE.Vector3(0, 0, 3 * (i / 4)));
}
points[4].y = -0.06;

const curve = new THREE.CatmullRomCurve3(points);
curve.type = "catmullrom";

// 创建曲线网格（仅用于计算，不添加到场景中）
const curvePoints = curve.getPoints(70);
const positionArray = new Float32Array(curvePoints.length * 3);
for (let i = 0; i < curvePoints.length; i++) {
  positionArray[i * 3] = curvePoints[i].x;
  positionArray[i * 3 + 1] = curvePoints[i].y;
  positionArray[i * 3 + 2] = curvePoints[i].z;
}

const splineGeometry = new THREE.BufferGeometry();
splineGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positionArray, 3)
);

const splineMesh = new THREE.Line(
  splineGeometry,
  new THREE.LineBasicMaterial()
);
// 注意：不再将splineMesh添加到场景中

// 处理窗口大小改变事件
window.addEventListener(
  "resize",
  function () {
    ww = window.innerWidth;
    wh = window.innerHeight;

    camera.aspect = ww / wh;
    camera.updateProjectionMatrix();
    renderer.setSize(ww, wh);
  },
  false
);

// 处理鼠标移动事件
document.body.addEventListener(
  "mousemove",
  function (e) {
    mouse.target.x = e.clientX;
    mouse.target.y = e.clientY;
  },
  false
);

// 加载纹理并初始化
const loader = new THREE.TextureLoader();
loader.crossOrigin = "Anonymous";

loader.load("./img.jpg", function (texture) {
  document.body.classList.remove("loading");

  // 不再添加曲线网格到场景
  // scene.add(splineMesh);

  // 创建管道材质
  const tubeMaterial = new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    map: texture,
  });
  tubeMaterial.map.wrapS = THREE.MirroredRepeatWrapping;
  tubeMaterial.map.wrapT = THREE.MirroredRepeatWrapping;
  tubeMaterial.map.repeat.set(textureParams.repeatX, textureParams.repeatY);

  // 创建管道几何体和网格
  const tubeGeometry = new THREE.TubeGeometry(curve, 70, 0.02, 30, false);
  const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
  scene.add(tubeMesh);

  // 初始化动画 - 纹理动画
  const hyperSpace = gsap.timeline({ repeat: -1 });
  hyperSpace.to(textureParams, {
    duration: 4,
    repeatX: 0.3,
    ease: "power1.inOut",
  });
  hyperSpace.to(
    textureParams,
    {
      duration: 12,
      offsetX: 8,
      ease: "power2.inOut",
    },
    0
  );
  hyperSpace.to(
    textureParams,
    {
      duration: 6,
      repeatX: 10,
      ease: "power2.inOut",
    },
    "-=5"
  );

  // 初始化动画 - 相机抖动动画
  const shake = gsap.timeline({ repeat: -1, repeatDelay: 5 });
  shake.to(
    cameraShake,
    {
      duration: 2,
      x: -0.01,
      ease: "rough({template: none, strength: 0.5, points: 100, taper: none, randomize: true, clamp: false})",
    },
    4
  );
  shake.to(cameraShake, {
    duration: 2,
    x: 0,
    ease: "rough({template: none, strength: 0.5, points: 100, taper: none, randomize: true, clamp: false})",
  });

  // 当前几何体引用
  let currentTubeGeometry = tubeGeometry;

  // 渲染循环
  function render() {
    // 更新材质偏移
    tubeMaterial.map.offset.x = textureParams.offsetX;
    tubeMaterial.map.offset.y += 0.001;
    tubeMaterial.map.repeat.set(textureParams.repeatX, textureParams.repeatY);

    // 更新相机位置
    mouse.position.x += (mouse.target.x - mouse.position.x) / 50;
    mouse.position.y += (mouse.target.y - mouse.position.y) / 50;

    mouse.ratio.x = mouse.position.x / ww;
    mouse.ratio.y = mouse.position.y / wh;

    camera.position.x = mouse.ratio.x * 0.044 - 0.025 + cameraShake.x;
    camera.position.y = mouse.ratio.y * 0.044 - 0.025;

    // 更新曲线
    if (curve && curve.points) {
      curve.points[2].x = 0.6 * (1 - mouse.ratio.x) - 0.3;
      curve.points[3].x = 0;
      curve.points[4].x = 0.6 * (1 - mouse.ratio.x) - 0.3;

      curve.points[2].y = 0.6 * (1 - mouse.ratio.y) - 0.3;
      curve.points[3].y = 0;
      curve.points[4].y = 0.6 * (1 - mouse.ratio.y) - 0.3;
    }

    // 重新生成管道几何体
    if (curve) {
      const newTubeGeometry = new THREE.TubeGeometry(
        curve,
        70,
        0.02,
        30,
        false
      );

      // 将新几何体的顶点数据复制到当前几何体
      if (tubeMesh && currentTubeGeometry) {
        const oldPositions = currentTubeGeometry.getAttribute("position");
        const newPositions = newTubeGeometry.getAttribute("position");

        // 如果顶点数量相同，则复制数据
        if (oldPositions.count === newPositions.count) {
          oldPositions.copy(newPositions);
          oldPositions.needsUpdate = true;
        } else {
          // 如果顶点数量不同，则直接替换几何体
          tubeMesh.geometry = newTubeGeometry;
          currentTubeGeometry = newTubeGeometry;
        }
      }
    }

    // 更新样条曲线（保留计算但不再渲染）
    if (splineMesh && curve) {
      const curvePoints = curve.getPoints(70);
      const positions = splineMesh.geometry.getAttribute("position");

      if (positions && positions.count === curvePoints.length) {
        for (let i = 0; i < curvePoints.length; i++) {
          positions.setXYZ(
            i,
            curvePoints[i].x,
            curvePoints[i].y,
            curvePoints[i].z
          );
        }
        positions.needsUpdate = true;
      }
    }

    // 渲染场景
    renderer.render(scene, camera);

    // 请求下一帧
    window.requestAnimationFrame(render);
  }

  // 开始渲染
  render();

  // 将对象暴露到全局，方便调试
  window.tunnel = {
    mouse,
    textureParams,
    cameraShake,
    scene,
    camera,
    renderer,
    curve,
    splineMesh,
    tubeMesh,
    currentTubeGeometry,
    tubeMaterial,
  };
});
