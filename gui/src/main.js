import * as THREE from "three";
import * as dat from "dat.gui";

import "./style.css";

// 创建GUI实例
const gui = new dat.GUI();

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

const geometry = new THREE.BoxGeometry();

const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

const cube = new THREE.Mesh(geometry, material);

scene.add(cube);

// 创建一个对象来控制立方体的参数
const cubeParams = {
  rotationX: cube.rotation.x,
  rotationY: cube.rotation.y,
  color: cube.material.color.getHex(),
};

// 添加控制项到GUI
gui.add(cubeParams, "rotationX", 0, Math.PI * 2).onChange((value) => {
  cube.rotation.x = value;
});
gui.add(cubeParams, "rotationY", 0, Math.PI * 2).onChange((value) => {
  cube.rotation.y = value;
});
gui.addColor(cubeParams, "color").onChange((value) => {
  cube.material.color.setHex(value);
});

function animate() {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;

  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();
