/**
 * 引入必要的三维渲染引擎和动画库
 */
import * as THREE from "three";
import gsap from "gsap";

/**
 * 创建三维场景的工厂函数
 * @returns {Object} 返回包含初始化方法的对象
 */
const createThreeJS = () => {
  // 场景基础变量定义
  const scene = new THREE.Scene(); // 创建场景实例
  let camera = null; // 相机实例
  let renderer = null; // 渲染器实例
  let floor = null; // 地面网格
  let myArray = null; // 立方体组
  let shape = null; // 单个立方体网格
  let geometry = null; // 几何体
  let material = null; // 材质
  let tl = null; // 动画时间轴

  /**
   * 设置正交相机
   * 用于创建一个不具有透视效果的相机，物体大小不会随距离改变
   */
  const setupCamera = () => {
    camera = new THREE.OrthographicCamera(
      window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / -2,
      1,
      1000
    );
    camera.position.y = 500;
    camera.position.z = 500;
    camera.position.x = 500;
    camera.updateProjectionMatrix();
    camera.lookAt(scene.position);
  };

  /**
   * 设置渲染器
   * 配置WebGL渲染器的基本属性，包括抗锯齿、阴影等
   */
  const setupRenderer = () => {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xf9f8ed, 1);
    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
  };

  /**
   * 设置场景光源
   * 添加三种不同位置的平行光，创建立体感
   */
  const setupLight = () => {
    // 主阴影光源
    const shadowlight = new THREE.DirectionalLight(0xffffff, 1.8);
    shadowlight.position.set(0, 50, 0);
    shadowlight.castShadow = true;
    shadowlight.shadowDarkness = 0.1;
    scene.add(shadowlight);

    // 正面补光
    const light = new THREE.DirectionalLight(0xffffff, 1.8);
    light.position.set(60, 100, 20);
    scene.add(light);

    // 背面补光
    const backLight = new THREE.DirectionalLight(0xffffff, 1);
    backLight.position.set(-40, 100, 20);
    scene.add(backLight);
  };

  /**
   * 创建地面
   * 添加一个接收阴影的平面作为地面
   */
  const setupFloor = () => {
    const floorGeometry = new THREE.PlaneGeometry(500, 500, 1, 1);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xf9f8ed });
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.material.side = THREE.DoubleSide;
    floor.position.y = -200;
    floor.position.z = -100;
    floor.rotation.x = (90 * Math.PI) / 180;
    floor.rotation.y = 0;
    floor.rotation.z = 0;
    floor.doubleSided = true;
    floor.receiveShadow = true;
    scene.add(floor);
  };

  /**
   * 初始化立方体组
   * 创建3x3x3的立方体网格，并添加缩放动画
   */
  const initShape = () => {
    myArray = new THREE.Group();
    scene.add(myArray);
    let lx = 0; // x轴位置计数器
    let ly = 0; // y轴位置计数器
    let lz = 0; // z轴位置计数器

    // 创建27个立方体(3x3x3)
    for (let i = 0; i < 27; i++) {
      // 创建立方体几何体和材质
      geometry = new THREE.BoxGeometry(50, 50, 50);
      material = new THREE.MeshLambertMaterial({
        color: 0x202020,
        shading: THREE.FlatShading,
      });
      shape = new THREE.Mesh(geometry, material);
      shape.castShadow = true;
      shape.receiveShadow = false;

      // 计算立方体位置
      if (lx % 3 == 0) {
        lx = 0;
        if (ly % 3 == 0) {
          lz += 1;
          ly = 0;
        }
        ly += 1;
      }

      // 设置立方体位置
      shape.position.x = lx * 55;
      shape.position.y = ly * 55;
      shape.position.z = lz * 55;

      myArray.add(shape);

      // 创建缩放动画
      tl = gsap.timeline({
        repeat: -1, // 无限循环
        repeatDelay: 0.5, // 循环间隔1秒
        delay: ly * 0.05, // 基于y轴位置的延迟
      });

      // 添加缩放动画序列
      tl.to(shape.scale, {
        duration: 0.7,
        x: 0,
        y: 0,
        z: 0, // 缩放到0
        ease: "expo.out",
      }).to(shape.scale, {
        duration: 0.7,
        x: 1,
        y: 1,
        z: 1, // 恢复原始大小
        ease: "expo.out",
      });

      lx += 1;
    }
  };

  /**
   * 渲染函数
   * 创建动画循环，持续渲染场景
   */
  const render = () => {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  };

  /**
   * 初始化函数
   * 按顺序执行所有设置函数
   */
  const init = () => {
    setupCamera(); // 设置相机
    setupRenderer(); // 设置渲染器
    setupLight(); // 设置光源
    setupFloor(); // 设置地面
    initShape(); // 初始化立方体
    render(); // 开始渲染
  };

  // 只暴露初始化方法
  return {
    init,
  };
};

// 创建实例并初始化
const threeJS = createThreeJS();
threeJS.init();
