import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import './style.css'
import javascriptLogo from './javascript.svg'
import { setupCounter } from './counter.js'

// 获取容器元素
const app = document.getElementById('app');

// 创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 100, 200);

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
app.appendChild(renderer.domElement);

// 添加环境光和平行光
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(100, 100, 50);
directionalLight.castShadow = true;
scene.add(directionalLight);

// 添加网格地面
const gridHelper = new THREE.GridHelper(1000, 20);
scene.add(gridHelper);

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 加载FBX模型
const loader = new FBXLoader();
let mixer = null;

loader.load('/animate.fbx', (fbx) => {
    fbx.scale.setScalar(1); // 调整模型大小
    fbx.position.set(0, 0, 0); // 调整模型位置
    
    // 创建动画混合器
    mixer = new THREE.AnimationMixer(fbx);
    
    // 播放所有动画
    const animations = fbx.animations;
    if (animations && animations.length > 0) {
        const action = mixer.clipAction(animations[0]);
        action.play();
    }
    
    scene.add(fbx);
}, 
(progress) => {
    console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
},
(error) => {
    console.error('Error loading model:', error);
});

// 动画时钟
const clock = new THREE.Clock();

// 渲染循环
function animate() {
    requestAnimationFrame(animate);
    
    // 更新轨道控制器
    controls.update();
    
    // 更新动画混合器
    if (mixer) {
        const delta = clock.getDelta();
        mixer.update(delta);
    }
    
    renderer.render(scene, camera);
}

// 处理窗口大小变化
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 开始动画循环
animate();
