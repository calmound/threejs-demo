import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// 场景设置
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

// 相机设置
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 2, 6);
controls.update();

// 创建光源
const ambientLight = new THREE.AmbientLight(0xaaaaaa, 0.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(2, 2, 2);
scene.add(directionalLight);

// 创建玻璃材质
const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x0000ff, // 玻璃的蓝色
  metalness: 0.0, // 非金属
  roughness: 0.1, // 光泽度较高，反射清晰
  clearcoat: 1.0, // 高光泽涂层
  clearcoatRoughness: 0.05, // 高光泽涂层的光滑度
  transmission: 1.0, // 完全透明
  ior: 1.5, // 折射率，玻璃的折射率
  opacity: 0.9, // 透明度
  envMapIntensity: 1.0, // 环境反射强度
  transparent: true,
});

// 创建金属材质
const metalMaterial = new THREE.MeshStandardMaterial({
  color: 0xaaaaaa, // 金属的灰色
  metalness: 1.0, // 完全金属
  roughness: 0.1, // 高光泽度，反射清晰
  envMapIntensity: 1.0, // 环境反射强度
});

// 创建几何体
const geometry = new THREE.SphereGeometry(1, 64, 64);

// 创建玻璃球体
const glassSphere = new THREE.Mesh(geometry, glassMaterial);
glassSphere.position.x = -2;
scene.add(glassSphere);

// 创建金属球体
const metalSphere = new THREE.Mesh(geometry, metalMaterial);
metalSphere.position.x = 2;
scene.add(metalSphere);

// 渲染循环
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// 窗口大小调整
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Function to generate texture with UV mapping support
function generateProceduralTexture(type = 'diffuse', width = 256, height = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Create a gradient or pattern based on texture type
    if (type === 'diffuse') {
        // Create a more detailed brick-like diffuse texture
        ctx.fillStyle = '#8B4513';  // Base brick color
        ctx.fillRect(0, 0, width, height);

        // Draw brick pattern
        ctx.fillStyle = '#A0522D';  // Slightly different brick color
        const brickWidth = width / 6;
        const brickHeight = height / 4;
        
        for (let y = 0; y < height; y += brickHeight) {
            for (let x = 0; x < width; x += brickWidth) {
                // Offset every other row
                const offsetX = (y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2;
                
                ctx.fillRect(
                    x + offsetX, 
                    y, 
                    brickWidth - 5,  // Small gap between bricks
                    brickHeight - 5
                );
            }
        }

        // Add some noise/texture
        for (let i = 0; i < width * height / 50; i++) {
            ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.1})`;
            ctx.fillRect(
                Math.random() * width, 
                Math.random() * height, 
                1, 1
            );
        }
    } else if (type === 'ao') {
        // Create a more sophisticated AO texture
        // Gradient from dark to light to simulate occlusion
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, 'rgba(0,0,0,0.7)');     // Dark in corners
        gradient.addColorStop(0.5, 'rgba(0,0,0,0.3)');   // Medium occlusion
        gradient.addColorStop(1, 'rgba(0,0,0,0.1)');     // Light in open areas

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Add some subtle noise to break up uniformity
        for (let i = 0; i < width * height / 20; i++) {
            ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.2})`;
            ctx.fillRect(
                Math.random() * width, 
                Math.random() * height, 
                1, 1
            );
        }
    }

    return canvas;
}

// Modify the AO Map Example to use generated textures with proper UV mapping
function createAOMapScene() {
    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Generate textures
    const diffuseTexture = new THREE.CanvasTexture(generateProceduralTexture('diffuse'));
    const aoTexture = new THREE.CanvasTexture(generateProceduralTexture('ao'));

    // Create geometries with proper UV mapping
    const geometries = [
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.SphereGeometry(1, 32, 32),
        new THREE.TorusKnotGeometry(1, 0.3, 100, 16)
    ];

    // Ensure UV2 is set for AO mapping
    geometries.forEach(geometry => {
        geometry.setAttribute('uv2', geometry.attributes.uv.clone());
    });

    // Create material with AO map
    const material = new THREE.MeshStandardMaterial({
        map: diffuseTexture,
        aoMap: aoTexture,
        aoMapIntensity: 1.0  // Adjust AO intensity
    });

    // Create meshes with AO mapping
    const meshes = geometries.map((geometry, index) => {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = (index - 1) * 3;
        scene.add(mesh);
        return mesh;
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        meshes.forEach((mesh, index) => {
            mesh.rotation.x += 0.01;
            mesh.rotation.y += 0.01;
        });

        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    // Handle window resizing
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Call the AO map scene creation function
createAOMapScene();
