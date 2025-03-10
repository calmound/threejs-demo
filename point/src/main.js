import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const count = 2000;
const distance = 100;
const geometry = new THREE.BufferGeometry();
const vertices = [];

for (let i = 0; i < count; i++) {
  const x = (Math.random() - 0.5) * 2 * distance;
  const y = (Math.random() - 0.5) * 2 * distance;
  const z = (Math.random() - 0.5) * 2 * distance;
  vertices.push(x, y, z);
}
geometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(vertices, 3)
);

const particles = new THREE.Points(
  geometry,
  new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2,
    sizeAttenuation: true,
  })
);

scene.add(particles);
