import * as THREE from 'three';

// 创建场景
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 600 / 400, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(600, 400);
const container = document.getElementById('scene-container');
container.appendChild(renderer.domElement);

let progress = 0;

// 创建平面用于过渡
const geometry = new THREE.PlaneGeometry(2, 2);
const material = new THREE.ShaderMaterial({
  uniforms: {
    progress: { value: 0.0 },
    from: { value: null },
    to: { value: null },
    dots: { value: 20.0 },
    center: { value: new THREE.Vector2(0, 0) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D from;
    uniform sampler2D to;
    uniform float progress;
   
    vec4 getToColor(vec2 uv) {
      return texture2D(to, uv);
    }

    vec4 getFromColor(vec2 uv) {
      return texture2D(from, uv);
    }


    const float SQRT_2 = 1.414213562373;
    uniform float dots;// = 20.0;
    uniform vec2 center;// = vec2(0, 0);

    vec4 transition(vec2 uv) {
      bool nextImage = distance(fract(uv * dots), vec2(0.5, 0.5)) < ( progress / distance(uv, center));
      return nextImage ? getToColor(uv) : getFromColor(uv);
    }



    void main() {
      gl_FragColor = transition(vUv);
    }
  `
});

// const plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

camera.position.z = 5;

// 加载随机图片
const textureLoader = new THREE.TextureLoader();
let currentTexture, nextTexture;

function loadRandomTexture(num) {
  return new Promise((resolve) => {
    textureLoader.load(
      `/src/${num}.jpg`,
      (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        resolve(texture);
      }
    );
  });
}

// 初始化纹理
async function initTextures() {
  currentTexture = await loadRandomTexture(1);
  nextTexture = await loadRandomTexture(2);
  material.uniforms.from.value = currentTexture;
  material.uniforms.to.value = nextTexture;
}

// 切换图片
async function transitionToNextImage() {
  material.uniforms.progress.value = 0;
  material.uniforms.from.value = currentTexture;
  material.uniforms.to.value = nextTexture;

  currentTexture = nextTexture;
  nextTexture = await loadRandomTexture();
}

let transitioning = false;
let isHovered = false;

function animate() {
  requestAnimationFrame(animate);

  if (transitioning) {
    if (isHovered && material.uniforms.progress.value < 1.0) {
      material.uniforms.progress.value += 0.02;
      if (material.uniforms.progress.value >= 1.0) {
        material.uniforms.progress.value = 1.0;
        transitioning = false;
      }
    } else if (!isHovered && material.uniforms.progress.value > 0.0) {
      material.uniforms.progress.value -= 0.02;
      if (material.uniforms.progress.value <= 0.0) {
        material.uniforms.progress.value = 0.0;
        transitioning = false;
      }
    }
  }

  renderer.render(scene, camera);
}

// 移除点击事件，改为鼠标悬停事件
renderer.domElement.addEventListener('mouseenter', () => {
  isHovered = true;
  transitioning = true;
});

renderer.domElement.addEventListener('mouseleave', () => {
  isHovered = false;
  transitioning = true;
});

// 响应窗口大小变化
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  material.uniforms.ratio.value = window.innerWidth / window.innerHeight;
});

// 启动应用
initTextures().then(() => {
  animate();
});
