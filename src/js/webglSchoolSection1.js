import { gsap } from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import vertexShader from "./shader/vertex.glsl";
import fragmentShader from "./shader/fragment.glsl";
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
      this.renderer = new THREE.WebGLRenderer({ canvas: canvas });
    } else {
      this.renderer = new THREE.WebGLRenderer();
      this.container.appendChild(this.renderer.domElement);
    }
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.physicallyCorrectLights = true;

    this.clock = new THREE.Clock();
    this.time = 0;
    this.isPlaying = true;
    this.textures = [];

    this.initiate(() => {
      this.setupResize();
      this.addObjects();
      this.addCamera();
      // this.settings();
      this.resize();
      this.play();
      this.render();
      this.mouseEvents();
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

  mouseEvents() {
    this.mouse = new THREE.Vector2();
    function mouseMove(event) {
      //マウスが動いた時に実行される関数
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      this.material.uniforms.mouse.value = this.mouse; //ここでuniform変数にマウスの値を渡している
    }
    window.addEventListener("mousemove", mouseMove.bind(this), false);
  }

  /**
   * Initialize GUI settings.
   */
  settings() {
    let that = this;
    this.settings = {
      progress: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
    console.log(this.gui);
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
    this.imageXAspect =
      this.textures[0].source.data.width / this.textures[0].source.data.height;
    this.imageYAspect =
      this.textures[0].source.data.height / this.textures[0].source.data.width;
    this.material.uniforms.uXAspect.value = this.Xaspect / this.imageXAspect;
    this.material.uniforms.uYAspect.value = this.Yaspect / this.imageYAspect;
    this.camera.aspect = this.width / this.height;
    this.camera.fov =
      2 * (180 / Math.PI) * Math.atan(this.height / (2 * this.dist));
    this.plane.scale.x = this.width;
    this.plane.scale.y = this.height;
    this.renderer.setSize(this.width, this.height);

    this.camera.updateProjectionMatrix();
  }
  /**
   * Add the camera to the scene.
   */
  addCamera() {
    //perspectiveで画面いっぱいにオブジェクトを映す場合
    const fov = 60;
    const fovRad = (fov / 2) * (Math.PI / 180);
    this.dist = this.height / 2 / Math.tan(fovRad); //画面いっぱいにオブジェクトを映す場合
    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.width / this.height,
      0.001,
      1000
    );

    // orthographicで画面いっぱいにオブジェクトを映す場合
    // let frustumSize = 1;
    // this.camera = new THREE.OrthographicCamera(
    //   frustumSize / -2,
    //   frustumSize / 2,
    //   frustumSize / 2,
    //   frustumSize / -2,
    //   -1000,
    //   1000
    // );

    //orthographicでオブジェクトの大きさを変えずに映す場合
    // this.camera.position.set(0, 0, 2);
    //perspectiveでオブジェクトの大きさを変えずに映す場合
    this.camera.position.set(0, 0, this.dist);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }
  /**
   * Add objects to the scene.
   */
  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives:",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: {
          value: 0,
        },
        uXAspect: {
          value: this.Xaspect / this.imageXAspect,
        },
        uYAspect: {
          value: this.Yaspect / this.imageYAspect,
        },
        progress: {
          value: 0,
        },
        uTexture: {
          value: this.textures[0],
        },
        mouse: {
          value: new THREE.Vector2(0, 0),
        },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
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
  /**
   * Render the scene.
   */
  render() {
    if (!this.isPlaying) {
      return;
    }
    const elapsedTime = this.clock.getElapsedTime();
    this.time = elapsedTime;
    this.material.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}
