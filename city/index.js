// ===========================================
// 3D城市动画场景 - Three.js + GSAP实现
// ===========================================

// 渲染器设置 - 负责将3D场景渲染到网页上
const renderer = new THREE.WebGLRenderer({ antialias: true }); // 开启抗锯齿
renderer.setPixelRatio(window.devicePixelRatio); // 适配高清屏幕
renderer.setSize(window.innerWidth, window.innerHeight); // 设置渲染尺寸为全屏

// 将渲染器的canvas元素添加到页面容器中
const container = document.getElementById("container");
container.appendChild(renderer.domElement);

// 相机设置 - 定义观察者的视角
const camera = new THREE.PerspectiveCamera(
  60, // 视野角度（度）
  window.innerWidth / window.innerHeight, // 宽高比
  1, // 近裁切面
  1000 // 远裁切面
);
camera.animAngle = 0; // 自定义属性：用于动画中的角度计算
// 设置相机初始位置（围绕原点的圆形轨道）
camera.position.set(
  Math.cos(camera.animAngle) * 400, // x坐标
  180, // y坐标（高度）
  Math.sin(camera.animAngle) * 400 // z坐标
);

// 场景设置 - 所有3D对象的容器
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x1e2630, 0.002); // 添加指数雾效果
renderer.setClearColor(scene.fog.color); // 背景色与雾色保持一致

// 光源设置 - 为场景提供光照
// 主光源：强白光从右上方照射
const mainLight = new THREE.DirectionalLight(0xffffff, 2);
mainLight.position.set(1, 1, 1);
scene.add(mainLight);

// 副光源：蓝色光从左下方照射，增加色彩层次
const secondaryLight = new THREE.DirectionalLight(0x002288, 1.5);
secondaryLight.position.set(-1, -1, -1);
scene.add(secondaryLight);

// 环境光：提供整体基础照明，防止阴影过暗
scene.add(new THREE.AmbientLight(0x404040));

// 穹顶创建 - 作为天空背景
const domeGeometry = new THREE.IcosahedronGeometry(700, 1); // 二十面体，半径700
const domeMaterial = new THREE.MeshPhongMaterial({
  color: 0xfb3550, // 粉红色
  flatShading: true, // 平面着色，呈现低多边形效果
  side: THREE.BackSide, // 渲染内表面（相机在内部）
});
scene.add(new THREE.Mesh(domeGeometry, domeMaterial));

// 地面创建 - 为建筑物提供基础平面
const groundGeometry = new THREE.PlaneGeometry(600, 600); // 600x600的正方形平面
const groundMaterial = new THREE.MeshPhongMaterial({
  color: 0x222a38, // 深蓝灰色
  transparent: true, // 启用透明度
  opacity: 0.8, // 80%不透明度
  flatShading: true, // 平面着色
  side: THREE.DoubleSide, // 双面渲染
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = Math.PI / 2; // 旋转90度使其水平
scene.add(ground);

// 网格辅助线 - 帮助理解空间结构
scene.add(new THREE.GridHelper(600, 10)); // 600x600网格，10个分割

// 建筑物生成 - 程序化创建城市建筑群
const geometry = new THREE.BoxGeometry(10, 10, 10); // 10x10x10的立方体
const colors = [0xfb3550, 0xffffff, 0x000000]; // 颜色数组：粉红、白色、黑色
const buildings = []; // 存储所有建筑物的数组

// 循环创建100个建筑物
for (let i = 0; i < 100; i++) {
  // 为每个建筑物随机选择颜色
  const material = new THREE.MeshPhongMaterial({
    color: colors[Math.floor(Math.random() * 3)], // 随机选择颜色
    flatShading: true, // 平面着色
  });

  // 创建建筑物网格并添加到场景
  const building = new THREE.Mesh(geometry, material);
  buildings.push(building); // 保存引用用于动画
  scene.add(building);
}

// 事件监听和程序启动
window.addEventListener("resize", onWindowResize, false); // 监听窗口大小变化
startAnimation(); // 启动动画循环
animate(); // 启动渲染循环

// 动画系统 - 创建建筑物和相机的动态效果
function startAnimation() {
  function animateLoop() {
    // 建筑物动画：随机缩放和位置变化
    buildings.forEach((building) => {
      const duration = Math.random() * 0.6 + 0.3; // 随机动画时长（0.3-0.9秒）
      const specialHeight = Math.random() < 0.1 ? 15 : 0; // 10%概率获得额外高度

      // 缩放动画：建筑物随机长高长胖
      TweenMax.to(building.scale, duration, {
        x: 1 + Math.random() * 3, // X轴缩放：1-4倍
        y: 1 + Math.random() * 20 + specialHeight, // Y轴缩放：1-21倍（可能额外+15）
        z: 1 + Math.random() * 3, // Z轴缩放：1-4倍
        ease: Power2.easeInOut, // 缓动效果
      });

      // 位置动画：建筑物在地面上随机移动
      TweenMax.to(building.position, duration, {
        x: -200 + Math.random() * 400, // X坐标：-200到200
        z: -200 + Math.random() * 400, // Z坐标：-200到200
        ease: Power2.easeInOut, // 缓动效果
      });
    });

    // 相机动画：围绕场景中心旋转
    TweenMax.to(camera, 1.5, {
      animAngle: camera.animAngle + (Math.random() - 0.5) * 2 * Math.PI, // 随机角度变化
      ease: Power1.easeInOut, // 缓动效果
      onUpdate: () => {
        // 每帧更新相机位置
        camera.position.x = Math.cos(camera.animAngle) * 400; // 圆周运动X坐标
        camera.position.z = Math.sin(camera.animAngle) * 400; // 圆周运动Z坐标
        camera.updateProjectionMatrix(); // 更新投影矩阵
        camera.lookAt(scene.position); // 始终看向场景中心
      },
    });

    // 循环控制：3.5秒后重新开始动画
    TweenMax.to(window, 3.5, { onComplete: animateLoop });
  }

  animateLoop(); // 启动动画循环
}

// 窗口大小调整处理 - 保持渲染比例正确
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight; // 更新相机宽高比
  camera.updateProjectionMatrix(); // 更新投影矩阵
  renderer.setSize(window.innerWidth, window.innerHeight); // 更新渲染器尺寸
}

// 渲染循环 - 持续绘制场景
function animate() {
  requestAnimationFrame(animate); // 请求下一帧
  renderer.render(scene, camera); // 渲染场景
}
