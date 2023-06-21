import { gsap } from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
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
      this.addGLTF().then(() => {
        this.setupResize();
        this.addObjects();
        this.addCamera();
        this.addLight();
        // this.settings();
        this.addControls();
        this.mouseEvent();
        this.touchEvent();
        this.resize();
        this.play();
        this.render();
      });
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
    this.dist = 15;
    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.width / this.height,
      0.001,
      10000
    );
    this.camera.position.set(0, 0, this.dist);
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
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1);
    lights.push(this.ambientLight);
    lights.forEach((light) => {
      this.scene.add(light);
    });
  }

  addGLTF() {
    return new Promise((resolve) => {
      const loader = new GLTFLoader();
      loader.load("/object/plane.glb", (gltf) => {
        this.planeGLTF = gltf;
        resolve();
      });
    });
  }

  /**
   * Add objects to the scene.
   */
  addObjects() {
    this.plane = this.planeGLTF.scene;
    this.plane.scale.set(0.1, 0.1,0.1);
    this.plane.position.set(0, 6, 0);
    this.scene.add(this.plane);


    this.earthMaterial = new THREE.MeshBasicMaterial({
      map: this.textures[0],
    });
    this.earthGeometry = new THREE.SphereGeometry(5, 32, 32);
    this.earth = new THREE.Mesh(this.earthGeometry, this.earthMaterial);
    this.earth.position.set(0, 0, 0);
    this.scene.add(this.earth);
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

    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}
