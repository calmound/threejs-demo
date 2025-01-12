<template>
  <view id="page">
    <canvas
      id="canvas_webgl2"
      type="webgl2"
      @touchstart="webgl_touch"
      @touchmove="webgl_touch"
      @touchend="webgl_touch"
      @touchcancel="webgl_touch"
    >
    </canvas>
  </view>
</template>

<script>
const THREE = requirePlugin("ThreeX");

const { document, window, Event, Event0, requestAnimationFrame, cancelAnimationFrame } = THREE.DHTML;
var requestId;

export default {
  data() {
    return {
      setting: {
        color: "#00ff00",
        width: 1,
        height: 2,
        depth: 3,
      },
    };
  },
  onUnload() {
    cancelAnimationFrame(requestId, this.canvas);
    this.worker && this.worker.terminate();
    this.renderer.forceContextLoss();
    this.renderer.context = null;
    this.renderer.domElement = null;
    this.renderer = null;
  },
  onLoad() {
    document.createElementAsync("canvas", "webgl2", this).then((canvas) => this.run(canvas).then());
  },

  methods: {
    webgl_touch(e) {
      const web_e = (window.platform == "devtools" ? Event : Event0).fix(e);
      this.canvas.dispatchEvent(web_e);
    },
    createMesh() {
      if (this.mesh) {
        this.scene.remove(this.mesh);
      }
      var material = new THREE.MeshLambertMaterial({
        color: this.setting.color,
      });
      var mesh = new THREE.Mesh(
        new THREE.BoxGeometry(this.setting.width, this.setting.height, this.setting.depth),
        material
      );

      this.scene.add(mesh);
      this.mesh = mesh;
    },
    async run(canvas) {
      var that = this;
      this.canvas = canvas;
      var renderer = (this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas,
      }));
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputEncoding = THREE.sRGBEncoding;

      var scene = (this.scene = new THREE.Scene());
      scene.background = "#888888";
      var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
      camera.position.set(10, 5, 10);
      camera.lookAt(scene.position);

      /////////////////////////////////////////
      const light0 = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(light0);
      //
      const light1 = new THREE.DirectionalLight(0xffffff, 0.5);
      light1.position.set(-5, 10, 5);
      scene.add(light1);
      //////////////////////////////////
      that.createMesh();

      ////////////////////////////////
      function animate() {
        requestAnimationFrame(() => {
          animate();
        });
        renderer.render(scene, camera);
      }
      animate();
    },
  },
};
</script>

<style>
canvas {
  width: 100vw;
  height: 100vh;
}
</style>
