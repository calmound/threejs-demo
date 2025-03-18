/**
 * Three.js 基础类
 * 提供了 Three.js 场景的基本设置和管理功能
 */
class ThreeBase {
  constructor() {
    // 初始化基本属性
    this.isAxis = false; // 是否显示坐标轴
    this.isStats = false; // 是否显示性能监控
    this.initCameraPos = [0, 0, 0]; // 相机初始位置
    this.scene = null; // 场景
    this.camera = null; // 相机
    this.renderer = null; // 渲染器
    this.controls = null; // 控制器
    this.stats = null; // 性能监控
    this.clock = null; // 时钟
  }

  /**
   * 初始化 Three.js 场景
   * @param {HTMLElement} container - 容器元素
   */
  initThree(container) {
    // 创建场景
    this.scene = new THREE.Scene();

    // 创建相机
    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      1,
      1000
    );
    this.camera.position.set(...this.initCameraPos);
    this.camera.lookAt(0, 0, 0);

    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 创建轨道控制器
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // 启用阻尼效果
    this.controls.dampingFactor = 0.05;

    // 创建时钟对象
    this.clock = new THREE.Clock();

    // 如果需要显示坐标轴
    if (this.isAxis) {
      const axesHelper = new THREE.AxesHelper(5);
      this.scene.add(axesHelper);
    }

    // 如果需要显示性能监控
    if (this.isStats) {
      this.stats = new Stats();
      container.appendChild(this.stats.dom);
    }

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // 开始动画循环
    this.animate();
  }

  /**
   * 动画循环
   */
  animate() {
    requestAnimationFrame(this.animate.bind(this));

    // 更新控制器
    this.controls.update();

    // 更新性能监控
    if (this.stats) {
      this.stats.update();
    }

    // 执行自定义动画
    this.animateAction();

    // 渲染场景
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * 自定义动画方法
   * 子类可以重写此方法来实现自定义动画
   */
  animateAction() {
    // 在子类中实现具体的动画逻辑
  }

  /**
   * 创建图表方法
   * 子类需要重写此方法来创建具体的场景内容
   */
  createChart() {
    // 在子类中实现具体的场景创建逻辑
  }
}

export default ThreeBase;
