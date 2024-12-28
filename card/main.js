import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";

class ChristmasAnimation {
  constructor() {
    this.container = document.querySelector("#scene-container");
    this.scene = new THREE.Scene();
    this.cards = [];
    this.setupScene();
  }

  setupScene() {
    this.createCamera();
    this.createLights();
    this.createRenderer();
    this.createControls();
    this.createCards();
    this.createParticles();
    this.addEventListeners();
    this.renderer.setAnimationLoop(() => this.render());
  }

  createCamera() {
    // 创建相机
    this.camera = new THREE.PerspectiveCamera(
      35, // 视角
      window.innerWidth / window.innerHeight, // 长宽比
      0.1, // 近剪切面
      1000 // 远剪切面
    );
    this.camera.position.set(0, 0, 15);
  }

  createLights() {
    // 创建环境光
    const ambientLight = new THREE.HemisphereLight(
      0xddeeff, // 天空颜色
      0x202020, // 地面颜色
      5 // 强度
    );

    // 创建主光源
    const mainLight = new THREE.DirectionalLight(0xffffff, 5);
    mainLight.position.set(10, 10, 10);

    this.scene.add(ambientLight, mainLight);
  }

  createRenderer() {
    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.physicallyCorrectLights = true;
    this.container.appendChild(this.renderer.domElement);
  }

  createControls() {
    // 创建轨道控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.5;
  }

  createCards() {
    // 创建卡片
    const cardGeometry = new THREE.PlaneGeometry(2, 3);
    const textureLoader = new THREE.TextureLoader();
    const positions = [
      [-4, 0, 0],
      [0, 0, 0],
      [4, 0, 0],
    ];

    const cardTextures = [
      "https://picsum.photos/600/768",
      "https://picsum.photos/600/769",
      "https://picsum.photos/600/770",
    ];

    positions.forEach((position, index) => {
      textureLoader.load(cardTextures[index], (texture) => {
        const material = new THREE.MeshStandardMaterial({
          map: texture,
          side: THREE.DoubleSide,
        });
        const card = new THREE.Mesh(cardGeometry, material);
        card.position.set(...position);
        card.userData.originalPosition = [...position];
        card.userData.targetRotation = new THREE.Euler(0, 0, 0);
        this.cards.push(card);
        this.scene.add(card);

        // 初始动画
        card.position.y = -10;
        this.animateCardEntry(card, index * 0.2);
      });
    });
  }

  createParticles() {
    // 创建粒子
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = Math.random() * 20 - 5;
      positions[i + 2] = (Math.random() - 0.5) * 20;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
    });

    this.particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(this.particles);
  }

  animateCardEntry(card, delay) {
    // 卡片进入动画
    setTimeout(() => {
      gsap.to(card.position, {
        y: card.userData.originalPosition[1],
        duration: 1.5,
        ease: "elastic.out(1, 0.5)",
      });
    }, delay * 1000);
  }

  animateCard(card) {
    // 卡片点击动画
    gsap.to(card.rotation, {
      y: card.rotation.y + Math.PI,
      duration: 1,
      ease: "power2.inOut",
    });
  }

  addEventListeners() {
    // 添加事件监听器
    window.addEventListener("resize", () => this.onWindowResize());
    window.addEventListener("mousemove", (event) => this.onMouseMove(event));
    this.renderer.domElement.addEventListener("click", (event) =>
      this.onCardClick(event)
    );
  }

  onWindowResize() {
    // 处理窗口大小调整
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMouseMove(event) {
    // 处理鼠标移动
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    this.cards.forEach((card) => {
      const distX = mouseX * 0.1;
      const distY = mouseY * 0.1;

      gsap.to(card.rotation, {
        x: distY,
        y: distX,
        duration: 0.5,
      });
    });
  }

  onCardClick(event) {
    // 处理卡片点击
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.cards);
    if (intersects.length > 0) {
      this.animateCard(intersects[0].object);
    }
  }

  updateParticles() {
    // 更新粒子位置
    const positions = this.particles.geometry.attributes.position.array;
    for (let i = 1; i < positions.length; i += 3) {
      positions[i] -= 0.01;
      if (positions[i] < -5) {
        positions[i] = 15;
      }
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  render() {
    // 渲染场景
    this.controls.update();
    this.updateParticles();
    this.renderer.render(this.scene, this.camera);
  }
}

// 页面加载时创建动画
window.addEventListener("DOMContentLoaded", () => {
  new ChristmasAnimation();
});
