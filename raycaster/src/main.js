import * as THREE from "three";

import "./style.css";
// 场景
const scene = new THREE.Scene();

// 相机：视角设置为 75 度，近裁剪面 0.1，远裁剪面 1000
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
// 将相机位置向后移动
camera.position.set(0, 0, 5);

// 渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff); // 增强环境光强度
scene.add(ambientLight);

const geometry = new THREE.BoxGeometry();
const originalColor = 0x00ff00;
const material = new THREE.MeshBasicMaterial({ color: originalColor });
// 将立方体位置调整到相机前方
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 0, 0);
scene.add(cube);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
  mouse.x = (event.clientX / renderer.domElement.offsetWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.offsetHeight) * 2 + 1;
}

let previousIntersected = null;

function animate() {
  requestAnimationFrame(animate);

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  console.log(
    "%c [ previousIntersected ]-51",
    "font-size:13px; background:pink; color:#bf2c9f;",
    previousIntersected
  );

  console.log(
    "%c [ intersects ]-57",
    "font-size:13px; background:pink; color:#bf2c9f;",
    intersects
  );

  if (
    previousIntersected &&
    (!intersects.length || previousIntersected !== intersects[0].object)
  ) {
    previousIntersected.material.color.setHex(originalColor);
    previousIntersected = null;
  }

  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;
    if (previousIntersected !== intersectedObject) {
      intersectedObject.material.color.setHex(0xff0000);
      previousIntersected = intersectedObject;
    }
  }

  renderer.render(scene, camera);
}

animate();
renderer.domElement.addEventListener("mousemove", onMouseMove, false);
