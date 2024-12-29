import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // 黑色背景更适合截图

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);  // 调整相机位置，使文字更容易看到

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 添加灯光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// 加载字体
const fontLoader = new FontLoader();

fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    // 创建文本几何体
    const textGeometry = new TextGeometry('Hello Three.js!', {
        font: font,
        size: 1,                    // 字体大小
        height: 0.2,                // 文字厚度
        curveSegments: 12,          // 曲线分段数
        bevelEnabled: true,         // 启用斜角
        bevelThickness: 0.03,       // 斜角深度
        bevelSize: 0.02,            // 斜角大小
        bevelOffset: 0,             // 斜角偏移
        bevelSegments: 5            // 斜角分段数
    });

    // 创建材质
    const textMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ff00,           // 绿色材质
        specular: 0x555555,        // 高光颜色
        shininess: 30              // 高光强度
    });

    // 创建网格
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // 居中文本
    textGeometry.computeBoundingBox();
    const centerOffset = -0.5 * (
        textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x
    );
    textMesh.position.x = centerOffset;

    scene.add(textMesh);
});

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// 处理窗口大小变化
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
