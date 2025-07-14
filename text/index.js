/**
 * Modern 3D Particle Text Animation using Three.js and GSAP
 * Refactored from original demo by Yausunobu Ikeda
 */

// Create texture loader instance
const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = "anonymous";

/**
 * BasicView - Modern Three.js setup class
 * Provides simple template for scene, camera, renderer, and viewport
 */
class BasicView {
  constructor() {
    this.containerElement =
      document.getElementById("container") || document.body;
    this.scene = new THREE.Scene();

    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      200000
    );
    this.camera.position.z = 5000;

    // Setup renderer with modern settings
    this.renderer = new THREE.WebGLRenderer({
      antialias: window.devicePixelRatio === 1.0,
      alpha: true,
    });
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.containerElement.appendChild(this.renderer.domElement);

    // Bind resize handler
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener("resize", this.handleResize, false);
  }

  /**
   * Window resize event handler
   */
  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Start rendering loop
   */
  startRendering() {
    this.update();
  }

  /**
   * Animation loop method called by requestAnimationFrame
   */
  update() {
    requestAnimationFrame(() => this.update());
    this.onTick();
    this.render();
  }

  /**
   * Render the scene
   */
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Called every frame - override in subclasses
   */
  onTick() {}
}

/**
 * Font and icon configuration
 */
const FONT_NAME = "Source Code Pro";
const FONT_AWESOME_ICONS = [
  "\uf001",
  "\uf002",
  "\uf003",
  "\uf004",
  "\uf005",
  "\uf006",
  "\uf007",
  "\uf008",
  "\uf009",
  "\uf00a",
  "\uf00b",
  "\uf00c",
  "\uf00d",
  "\uf00e",
  "\uf00f",
  "\uf010",
];

/**
 * Modern particle text animation demo
 */
class ParticleTextDemo {
  constructor() {
    // Wait for fonts to load before initializing
    this.waitForFonts().then(() => {
      new ParticleTextWorld();
    });
  }

  /**
   * Wait for fonts to load using modern font loading API
   */
  async waitForFonts() {
    try {
      // Check if fonts are already loaded
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // Additional check for Font Awesome
      const testElement = document.createElement("span");
      testElement.style.fontFamily = "FontAwesome";
      testElement.style.fontSize = "16px";
      testElement.innerHTML = "\uf001";
      testElement.style.position = "absolute";
      testElement.style.left = "-9999px";
      document.body.appendChild(testElement);

      // Wait a bit for font to load
      await new Promise((resolve) => setTimeout(resolve, 100));

      document.body.removeChild(testElement);
    } catch (error) {
      console.warn("Font loading check failed, proceeding anyway:", error);
    }
  }
}
/**
 * 3D Particle Text World - Main animation class
 */
class ParticleTextWorld extends BasicView {
  constructor() {
    super();

    // Configuration
    this.CANVAS_W = 160;
    this.CANVAS_H = 40;
    this.WORD_LIST = ["Three.js"];
    this.matrixLength = 4; // Reduced for simplicity
    this.particleList = [];
    this.hue = 0.6; // Color hue 0.0-1.0
    this.HELPER_ZERO = new THREE.Vector3(0, 0, 0);

    this.setup();
    this.createLogo();
    this.startRendering();
  }
  /**
   * Setup the 3D scene
   */
  setup() {
    // Camera setup
    this.camera.far = 100000;
    this.camera.near = 1;
    this.camera.position.z = 5000;
    this.camera.lookAt(this.HELPER_ZERO);

    // Create background
    const plane = new THREE.PlaneGeometry(50000, 50000);

    // Create a simple gradient background instead of loading external image
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Create gradient
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(0.5, "#16213e");
    gradient.addColorStop(1, "#0f0f23");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    const bgTexture = new THREE.CanvasTexture(canvas);
    const bgMaterial = new THREE.MeshBasicMaterial({ map: bgTexture });

    this.bg = new THREE.Mesh(plane, bgMaterial);
    this.bg.position.z = -10000;
    this.scene.add(this.bg);

    // Add lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 1).normalize();
    this.scene.add(light);

    // Container for particle motion
    this.wrap = new THREE.Object3D();
    this.scene.add(this.wrap);
    // Generate particle texture atlas using modern Canvas API
    const SIZE = 256;
    const atlasCanvas = document.createElement("canvas");
    const atlasSize = SIZE * this.matrixLength;
    atlasCanvas.width = atlasSize;
    atlasCanvas.height = atlasSize;
    const atlasCtx = atlasCanvas.getContext("2d");

    // Set font properties
    atlasCtx.font = "200px FontAwesome";
    atlasCtx.fillStyle = "#FFFFFF";
    atlasCtx.textAlign = "center";
    atlasCtx.textBaseline = "middle";

    // Draw Font Awesome icons in grid
    for (let i = 0; i < this.matrixLength * this.matrixLength; i++) {
      const iconIndex = i % FONT_AWESOME_ICONS.length;
      const char = FONT_AWESOME_ICONS[iconIndex];
      const x = (i % this.matrixLength) * SIZE + SIZE / 2;
      const y = Math.floor(i / this.matrixLength) * SIZE + SIZE / 2;
      atlasCtx.fillText(char, x, y);
    }

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(atlasCanvas);
    texture.needsUpdate = true;
    // Create particles
    const ux = 1 / this.matrixLength;
    const uy = 1 / this.matrixLength;
    this.particleList = [];

    for (let i = 0; i < this.CANVAS_W; i++) {
      for (let j = 0; j < this.CANVAS_H; j++) {
        const ox = Math.floor(this.matrixLength * Math.random());
        const oy = Math.floor(this.matrixLength * Math.random());

        const geometry = new THREE.PlaneGeometry(40, 40);
        this.changeUVs(geometry, ux, uy, ox, oy);

        const material = new THREE.MeshLambertMaterial({
          color: 0xffffff,
          map: texture,
          transparent: true,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        });

        const particle = new THREE.Mesh(geometry, material);
        this.wrap.add(particle);
        this.particleList.push(particle);
      }
    }

    this.createParticleCloud();
  }
  /**
   * Create background particle cloud
   */
  createParticleCloud() {
    const geometry = new THREE.BufferGeometry();
    const numParticles = 10000; // Reduced for simplicity
    const SIZE = 10000;
    const positions = new Float32Array(numParticles * 3);

    for (let i = 0; i < numParticles; i++) {
      positions[i * 3] = SIZE * (Math.random() - 0.5);
      positions[i * 3 + 1] = SIZE * (Math.random() - 0.5);
      positions[i * 3 + 2] = SIZE * (Math.random() - 0.5);
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Create simple particle texture instead of loading external image
    const particleCanvas = document.createElement("canvas");
    particleCanvas.width = 64;
    particleCanvas.height = 64;
    const particleCtx = particleCanvas.getContext("2d");

    // Create radial gradient for particle
    const gradient = particleCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    particleCtx.fillStyle = gradient;
    particleCtx.fillRect(0, 0, 64, 64);

    const particleTexture = new THREE.CanvasTexture(particleCanvas);

    const material = new THREE.PointsMaterial({
      size: 30,
      color: 0x444444,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthTest: false,
      map: particleTexture,
    });

    const mesh = new THREE.Points(geometry, material);
    mesh.position.set(0, 0, 0);
    this.scene.add(mesh);
  }
  /**
   * Create logo animation with particles
   */
  createLogo() {
    // Create text canvas
    const canvas = document.createElement("canvas");
    canvas.width = this.CANVAS_W;
    canvas.height = this.CANVAS_H;
    const ctx = canvas.getContext("2d");

    // Draw text - always "Three.js"
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `30px ${FONT_NAME}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.WORD_LIST[0], this.CANVAS_W / 2, this.CANVAS_H / 2);
    // Create GSAP timeline - single animation, no loop
    const timeline = gsap.timeline({
      onComplete: () => {
        // Animation complete - show text for longer time
        gsap.to("#coverBlack", {
          duration: 1.0,
          opacity: 1.0,
          delay: 5.0, // Show text for 5 seconds before fade
          onComplete: () => {
            // Restart the animation after a pause
            setTimeout(() => {
              this.createLogo();
            }, 2000);
          },
        });
      },
    });

    // Hide all particles initially
    for (let i = 0; i < this.particleList.length; i++) {
      this.particleList[i].visible = false;
    }

    // Analyze pixel data to determine text shape
    const pixelColors = ctx.getImageData(
      0,
      0,
      this.CANVAS_W,
      this.CANVAS_H
    ).data;
    const existDotList = [];
    let existDotCount = 0;

    for (let i = 0; i < this.CANVAS_W; i++) {
      existDotList[i] = [];
      for (let j = 0; j < this.CANVAS_H; j++) {
        // Check if pixel is transparent (text area)
        const flag = pixelColors[(i + j * this.CANVAS_W) * 4 + 3] === 0;
        existDotList[i][j] = flag;
        if (flag === true) existDotCount++;
      }
    }
    // Create particle motion animation
    let cnt = 0;
    const max = this.CANVAS_W * this.CANVAS_H;

    for (let i = 0; i < this.CANVAS_W; i++) {
      for (let j = 0; j < this.CANVAS_H; j++) {
        // Skip transparent pixels
        if (existDotList[i][j] === true) continue;

        const particle = this.particleList[cnt];

        // Set particle color with HSL
        particle.material.color.setHSL(
          this.hue + ((i * canvas.height) / max - 0.5) * 0.2,
          0.5,
          0.6 + 0.4 * Math.random()
        );

        this.wrap.add(particle);

        // Define target and start positions
        const targetPos = {
          x: (i - canvas.width / 2) * 30,
          y: (canvas.height / 2 - j) * 30,
          z: 0,
        };

        const startPos = {
          x: 2000 * (Math.random() - 0.5) - 500,
          y: 1000 * (Math.random() - 0.5),
          z: 10000,
        };

        // Set initial position and rotation
        particle.position.set(startPos.x, startPos.y, startPos.z);
        particle.rotation.z = 10 * Math.PI * (Math.random() - 0.5);
        particle.visible = false;

        // Calculate delay for staggered animation - longer delays
        const delay = (cnt / 1600) * 4.0 + 2.0 * Math.random();

        // Rotation animation - longer duration
        timeline.to(
          particle.rotation,
          {
            duration: 8.0,
            z: 0,
            ease: "power2.inOut",
          },
          delay
        );

        // Show particle
        timeline.set(particle, { visible: true }, delay);

        // Simple position animation - longer duration
        timeline.to(
          particle.position,
          {
            duration: 10.0,
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z,
            ease: "expo.inOut",
          },
          delay
        );

        cnt++;
      }
    }
    // Animate particle container
    this.wrap.position.z = -5000;
    timeline.to(
      this.wrap.position,
      {
        duration: 18.0,
        z: 6000,
        ease: "power4.in",
      },
      0
    );

    // Simple camera motion - only one variation
    timeline.set(this.camera.position, { x: 200, y: -200, z: 1000 }, 0);
    timeline.to(
      this.camera.position,
      {
        duration: 20.0,
        x: 0,
        y: 0,
        z: 5000,
        ease: "power2.inOut",
      },
      0
    );
    // Fade in from black cover
    timeline.to(
      "#coverBlack",
      {
        duration: 1.0,
        opacity: 0.0,
      },
      0
    );

    // Simple time scaling - normal speed only
    timeline.timeScale(1.0);

    // Update background color
    this.bg.material.color.setHSL(this.hue, 1.0, 0.5);

    // Cycle hue
    this.hue += 0.2;
    if (this.hue >= 1.0) {
      this.hue = 0.0;
    }
  }
  /**
   * Called every frame
   */
  onTick() {
    super.onTick();
    this.camera.lookAt(this.HELPER_ZERO);

    // Position background opposite to camera
    const vec = this.camera.position.clone();
    vec.negate();
    vec.normalize();
    vec.multiplyScalar(10000);
    this.bg.position.copy(vec);
    this.bg.lookAt(this.camera.position);
  }

  /**
   * Change UV coordinates of geometry for texture atlas
   * @param {THREE.PlaneGeometry} geometry
   * @param {number} unitX
   * @param {number} unitY
   * @param {number} offsetX
   * @param {number} offsetY
   */
  changeUVs(geometry, unitX, unitY, offsetX, offsetY) {
    const uvAttribute = geometry.attributes.uv;
    if (uvAttribute) {
      const uvArray = uvAttribute.array;
      for (let i = 0; i < uvArray.length; i += 2) {
        uvArray[i] = (uvArray[i] + offsetX) * unitX;
        uvArray[i + 1] = (uvArray[i + 1] + offsetY) * unitY;
      }
      uvAttribute.needsUpdate = true;
    }
  }
}

// Initialize the demo when page loads
window.addEventListener("load", () => {
  new ParticleTextDemo();
});
