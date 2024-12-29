import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";

let camera, scene, renderer;
let particles = [];
let originalPositions = [];
let text;

init();
animate();

function init() {
  // Scene setup
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 20;

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.getElementById("container").appendChild(renderer.domElement);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Load font and create text
  const fontLoader = new FontLoader();
  fontLoader.load("./fonts/chinese.typeface.json", function (font) {
    const textGeometry = new TextGeometry("你好，我是三木", {
      font: font,
      size: 1.5,
      height: 0.1,
      curveSegments: 24,
      bevelEnabled: false,
    });

    textGeometry.center();

    // Create particles from text geometry
    const material = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
    });

    const positions = [];
    const geometry = new THREE.BufferGeometry();

    // Sample points from the text geometry
    const textMesh = new THREE.Mesh(textGeometry);
    const sampler = new MeshSurfaceSampler(textMesh).build();

    for (let i = 0; i < 50000; i++) {
      const position = new THREE.Vector3();
      sampler.sample(position);
      positions.push(position.x, position.y, position.z);
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    text = new THREE.Points(geometry, material);
    scene.add(text);

    // Store original positions for animation
    originalPositions = positions.slice();
  });

  // Handle window resize
  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  if (text) {
    const positions = text.geometry.attributes.position.array;
    const time = Date.now() * 0.001; // Current time in seconds

    for (let i = 0; i < positions.length; i += 3) {
      const originalX = originalPositions[i];
      const originalY = originalPositions[i + 1];
      const originalZ = originalPositions[i + 2];

      // Add some noise to the positions
      positions[i] = originalX + Math.sin(time + i) * 0.1;
      positions[i + 1] = originalY + Math.cos(time + i) * 0.1;
      positions[i + 2] = originalZ + Math.sin(time + i) * 0.1;

      // Optional: Add dispersing effect
      if (Math.sin(time) > 0) {
        positions[i] += Math.sin(time + i) * 0.02;
        positions[i + 1] += Math.cos(time + i) * 0.02;
        positions[i + 2] += Math.sin(time + i) * 0.02;
      }
    }

    text.geometry.attributes.position.needsUpdate = true;
  }

  renderer.render(scene, camera);
}
