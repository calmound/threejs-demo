import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

let camera, scene, renderer, controls;
let currentText = null;

// Font paths
const FONTS = {
  helvetiker:
    "https://unpkg.com/three@0.159.0/examples/fonts/helvetiker_regular.typeface.json",
  fangsong: "./fonts/FangSong_Regular.json",
  chinese: "./fonts/chinese.typeface.json",
};

init();
animate();

function init() {
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a);

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.getElementById("container").appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);

  // Add grid helper
  const gridHelper = new THREE.GridHelper(10, 10);
  scene.add(gridHelper);

  // Initial text creation
  createText();

  // Event listeners
  window.addEventListener("resize", onWindowResize, false);
  setupEventListeners();
}

function createText(
  text = "Hello, 三木.js",
  fontName = "fangsong",
  size = 1,
  height = 0.2,
  bevel = false
) {
  // Remove existing text
  if (currentText) {
    scene.remove(currentText);
  }

  // Load font and create text
  const fontLoader = new FontLoader();
  fontLoader.load(FONTS[fontName], function (font) {
    const textGeometry = new TextGeometry(text, {
      font: font,
      size: size,
      height: height,
      curveSegments: 32,
      bevelEnabled: bevel,
      bevelThickness: 0.05,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 8,
    });

    textGeometry.center();

    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.4,
    });

    currentText = new THREE.Mesh(textGeometry, material);
    scene.add(currentText);
  });
}

function setupEventListeners() {
  // Font selection
  const fontSelect = document.getElementById("fontSelect");
  fontSelect.addEventListener("change", updateText);

  // Text input
  const textInput = document.getElementById("textInput");
  textInput.addEventListener("input", updateText);

  // Size input
  const sizeInput = document.getElementById("sizeInput");
  sizeInput.addEventListener("input", updateText);

  // Height input
  const heightInput = document.getElementById("heightInput");
  heightInput.addEventListener("input", updateText);

  // Bevel checkbox
  const bevelCheckbox = document.getElementById("bevelCheckbox");
  bevelCheckbox.addEventListener("change", updateText);
}

function updateText() {
  const text = document.getElementById("textInput").value;
  const font = document.getElementById("fontSelect").value;
  const size = parseFloat(document.getElementById("sizeInput").value);
  const height = parseFloat(document.getElementById("heightInput").value);
  const bevel = document.getElementById("bevelCheckbox").checked;

  createText(text, font, size, height, bevel);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
