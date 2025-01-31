import * as THREE from 'three';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a plane geometry
const geometry = new THREE.PlaneGeometry(2, 2);

// Create shader material
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0.0 }
  }
});

// Create mesh
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

// Position camera
camera.position.z = 5;

// Animation loop
let startTime = Date.now();
function animate() {
  requestAnimationFrame(animate);

  let elapsed = (Date.now() - startTime) * 0.003; // 转换成秒
  material.uniforms.uTime.value = elapsed;

  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
});

animate();
