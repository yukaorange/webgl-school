import { gsap } from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import vertexShader from "./shader/vertex.glsl";
// import fragmentShader from "./shader/fragment.glsl";
import * as dat from "lil-gui";
import { TextureLoader } from "three";

export class Sketch {
  /**
   * Create a Sketch instance.
   * @param {Object} options - Configuration object for the Sketch.
   * @param {HTMLElement} options.dom - The container element for the renderer.
   * @param {Array<string>} options.images - Array of image URLs to load as textures.
   */
  constructor(options) {
    this.scene = new THREE.Scene();
    this.container = options.dom;
    this.slider = this.container.querySelector("#slider");
    this.images = this.slider.getAttribute("data-images").split(",");
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.Xaspect = this.width / this.height;
    this.Yaspect = this.height / this.width;
    //rendererについて、canvasがあればそれを使う
    let canvas = this.container.querySelector("canvas");
    if (canvas) {
      this.renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    } else {
      this.renderer = new THREE.WebGLRenderer({ alpha: true });
      this.container.appendChild(this.renderer.domElement);
    }
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xffffff, 0);

    this.clock = new THREE.Clock();
    this.isPlaying = true;
    this.textures = [];

    //wingの設定
    this.rotationSpeed = 0.25; // 一定の回転速度
    this.targetSpeed = 0.25; // 一定の目標速度
    this.accelerationSpeed = 10; // マウス押下時の加速速度

    this.initiate(() => {
      this.setupResize();
      this.addObjects();
      this.addCamera();
      this.addLight();
      this.addFog();
      // this.settings();
      // this.addControls();
      this.mouseEvent();
      this.touchEvent();
      this.resize();
      this.play();
      this.render();
    });
  }

  /**
   * Load textures and execute the callback function.
   * @param {Function} cb - Callback function to execute after loading textures.
   */
  initiate(cb) {
    const promises = this.images.map((url, i) => {
      return new Promise((resolve) => {
        // loadの第二引数は読み込み完了時に実行されるコールバック関数
        this.textures[i] = new THREE.TextureLoader().load(url, resolve);
      });
    });

    // texturesを全て読み込んだら実行される
    Promise.all(promises).then(() => {
      cb.bind(this)();
    });
  }

  /**
   * Initialize GUI settings.
   */
  settings() {
    this.settings = {
      progress: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
  }
  /**
   * Set up the window resize event listener.
   */
  setupResize() {
    this.currentWidth = window.innerWidth;
    this.resizeTimeout = null;

    window.addEventListener("resize", () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        const newWidth = window.innerWidth;
        const widthDifference = Math.abs(this.currentWidth - newWidth);

        if (widthDifference <= 10) {
          console.log(this.currentWidth, "リサイズなし");
          return;
        }

        this.currentWidth = newWidth;
        console.log(this.currentWidth, "リサイズ検知");
        this.resize();
      }, 100);
    });
  }
  /**
   * Update Sketch dimensions and aspect ratios on window resize.
   */
  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.Xaspect = this.width / this.height;
    this.Yaspect = this.height / this.width;
    this.camera.aspect = this.width / this.height;
    this.renderer.setSize(this.width, this.height);
    this.camera.updateProjectionMatrix();
  }
  /**
   * Add the camera to the scene.
   */
  addCamera() {
    const fov = 60;
    const fovRad = (fov / 2) * (Math.PI / 180);
    this.dist = 50;
    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.width / this.height,
      0.001,
      10000
    );

    this.camera.position.set(-75, -150, this.dist);
  }
  /**controls
   */
  addControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  /**
   * Add lights to the scene.
   */
  addLight() {
    const lights = [];

    lights.forEach((light) => {
      this.scene.add(light);
    });
  }

  addFog() {
    this.scene.fog = new THREE.Fog(
      0x555555, //color
      75, //near
      150 //far
    );
  }

  /**
   * Add objects to the scene.
   */
  addObjects() {
    let wingHeight = 25;
    let wingWidth = 1.5;
    let strutHeight = 2000; //マジックナンバー
    this.wingGeometry = new THREE.ConeGeometry(wingWidth, wingHeight, 3);
    this.wingGeometry.translate(0, wingHeight / 2, 0);
    this.strutGeometry = new THREE.CylinderGeometry(
      0.5, //radiusTop
      0.8, //radiusBottom
      strutHeight //height
    );
    this.material = new THREE.MeshBasicMaterial({ map: this.textures[0] });
    this.spinnerGroup = new THREE.Group();
    this.fanGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      let wing = new THREE.Mesh(this.wingGeometry, this.material);
      wing.rotation.z = ((Math.PI * 2) / 3) * i; // rotate each wing differently
      this.spinnerGroup.add(wing);
    }
    this.spinnerGroup.position.z = 2;
    this.strut = new THREE.Mesh(this.strutGeometry, this.material);
    this.strut.position.y = -strutHeight / 2;
    this.fanGroup.add(this.spinnerGroup);

    this.fanGroup.add(this.strut);

    this.scene.add(this.fanGroup);
  }
  /**
   * Stop the rendering loop.
   */
  stop() {
    this.isPlaying = false;
  }
  /**
   * Resume the rendering loop.
   */
  play() {
    if (!this.isPlaying) {
      this.render();
      this.isPlaying = true;
    }
  }

  //マウスイベント
  mouseEvent() {
    this.mouseFlg = false;
    window.addEventListener("mousedown", () => {
      this.mouseFlg = true;
    });
    window.addEventListener("mouseup", () => {
      this.mouseFlg = false;
    });
  }
  //タッチイベント
  touchEvent() {
    this.mouseFlg = false;
    window.addEventListener("touchstart", () => {
      this.mouseFlg = true;
    });
    window.addEventListener("touchend", () => {
      this.mouseFlg = false;
    });
  }

  /**
   * Render the scene.
   */
  render() {
    if (!this.isPlaying) {
      return;
    }

    const elapsedTime = this.clock.getElapsedTime();
    this.time = elapsedTime;

    this.camera.lookAt(this.scene.position);

    if (this.mouseFlg) {
      this.rotationSpeed = this.accelerationSpeed;
    } else if (this.rotationSpeed > this.targetSpeed) {
      let speedDifference = this.rotationSpeed - this.targetSpeed;
      // this.rotationSpeed -= speedDifference * 0.1;
      this.rotationSpeed = this.targetSpeed;
    } else {
      this.rotationSpeed = this.targetSpeed;
    }

    this.spinnerGroup.rotation.z = this.time * this.rotationSpeed;
    this.fanGroup.rotation.y = Math.sin(this.time * 0.75) * 0.3;

    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}
