import { gsap } from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
// import vertexShader from "./shader/vertex.glsl";
// import fragmentShader from "./shader/fragment.glsl";
import * as dat from "lil-gui";
import { TextureLoader } from "three";
import { max } from "date-fns";

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

    //planeアニメションの設定
    this.radius = 8; //槍の位置(半径)
    this.earthRadius = 7; //地球の半径
    this.dir = 0;
    this.destinaitonPos = new THREE.Vector3(0, 0, 0);
    this.destinaitonSpeed = 0.1;
    this.planeSpeed = 0.0075;
    this.latitude = 0;
    this.longitude = 0;

    this.initiate(() => {
      this.add3D().then(() => {
        this.setupResize();
        this.addObjects();
        this.addCamera();
        this.addLight();
        this.addFog();
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
    this.dist = 20;
    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.width / this.height,
      0.001,
      10000
    );
    this.camera.position.set(0, 10, this.dist);
    // this.camera.position.set(0, 0, this.dist);
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

  /**
   * Add fog to the scene.
   */
  addFog() {
    this.scene.fog = new THREE.Fog(0x000000, 20, 40);
  }

  /**
   * Load the model.
   */
  add3D() {
    const GLTFloader = new GLTFLoader();
    const FBXloader = new FBXLoader();

    const planePromise = new Promise((resolve, reject) => {
      GLTFloader.load(
        "/object/plane.glb",
        (gltf) => {
          this.planeGLTF = gltf;
          resolve();
        },
        undefined,
        (error) => {
          console.error(error);
          reject(error);
        }
      );
    });

    const longinusPromise = new Promise((resolve, reject) => {
      FBXloader.load(
        "/object/longinus.fbx",
        (fbx) => {
          this.longinusFBX = fbx;
          resolve();
        },
        undefined,
        (error) => {
          console.error(error);
          reject(error);
        }
      );
    });
    // const mark1Promise = new Promise((resolve, reject) => {
    //   FBXloader.load(
    //     "/object/mark1.fbx",
    //     (fbx) => {
    //       this.mark1FBX = fbx;
    //       resolve();
    //     },
    //     undefined,
    //     (error) => {
    //       console.error(error);
    //       reject(error);
    //     }
    //   );
    // });

    // return Promise.all([planePromise, longinusPromise, mark1Promise]);
    return Promise.all([planePromise, longinusPromise]);
  }

  /**
   * Add objects to the scene.
   */
  addObjects() {
    this.group = new THREE.Group();

    this.plane = this.planeGLTF.scene;
    this.plane.size = 0.075;
    this.plane.scale.set(this.plane.size, this.plane.size, this.plane.size);
    this.plane.position.set(0, this.radius, 0);
    this.plane.direction = new THREE.Vector3(0, 0, 1.0).normalize();
    this.group.add(this.plane);

    this.earthMaterial = new THREE.MeshBasicMaterial({
      map: this.textures[0],
      color: 0xff0000,
      wireframe: true,
    });
    this.earthGeometry = new THREE.SphereGeometry(this.earthRadius, 32, 32);
    this.earth = new THREE.Mesh(this.earthGeometry, this.earthMaterial);
    this.earth.position.set(0, 0, 0);
    this.group.add(this.earth);

    this.destination = this.longinusFBX;
    const color = new THREE.Color("#7d1119");
    this.destination.children[0].material[0].color = color;
    this.destination.children[0].material[1].color = color;
    this.destination.scale.set(0.03, 0.03, 0.03);
    this.destination.position.set(0, -1, 0);
    this.destination.direction = new THREE.Vector3(0, 0, 1.0).normalize();
    this.group.add(this.destination);

    // this.mark1 = this.mark1FBX;
    // this.mark1.size = 0.001;
    // this.mark1.scale.set(this.mark1.size, this.mark1.size, this.mark1.size);
    // this.mark1.rotation.y = (Math.PI / 2) * 3;
    // this.mark1.position.set(0, -2, 0);
    // this.group.add(this.mark1);

    this.group.position.set(0, -5, 0);
    // this.group.position.set(0, 0, 0);
    this.scene.add(this.group);
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

  translateGeoCoords(latitude, longitude, radius) {
    const phi = (latitude * Math.PI) / 180; //緯度をラジアンに変換
    const theta = ((longitude - 180) * Math.PI) / 180; //経度をラジアンに変換
    const x = -(radius * Math.cos(phi) * Math.cos(theta));
    const y = radius * Math.sin(phi);
    const z = radius * Math.cos(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
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

    //槍の座標移動
    const speed = 1;
    const freq = 0.75;
    const amp = 60;
    this.latitude = Math.sin(this.time * freq) * amp;
    this.longitude += speed;
    const pos = this.translateGeoCoords(
      this.latitude, //緯度
      this.longitude, //経度
      this.radius
    );
    this.destination.position.set(pos.x, pos.y, pos.z);

    //地球の中心に向く（槍）
    longinus.bind(this)();
    function longinus() {
      const prevDir = this.destination.direction.clone();
      const dirToCenter = new THREE.Vector3();
      dirToCenter.subVectors(this.earth.position, this.destination.position);
      dirToCenter.normalize(); //地球の中心に向くベクトル

      const normalAxis = new THREE.Vector3();
      normalAxis.crossVectors(prevDir, dirToCenter);
      normalAxis.normalize(); //中心を向くベクトルと前回の槍の向きの外積

      const cos = prevDir.dot(dirToCenter);
      const radians = Math.acos(cos); //中心を向くベクトルと槍の向きのなす角

      // console.log(
      //   "前回の槍の向き",
      //   prevDir,
      //   "中心方向ベクトル",
      //   dirToCenter,
      //   "外積",
      //   normalAxis,
      //   "角度",
      //   radians
      // );

      const quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle(normalAxis, radians); //中心を向くベクトルと槍の向きのなす角からクォータニオンを作成

      const step = 0.5;
      this.destination.quaternion.slerp(quaternion, step); //槍のクォータニオンに掛け合わせる
    }

    //槍を追いかける（飛行機）
    plane.bind(this)();
    function plane() {
      const prevPos = this.plane.position.clone();
      //地球の中心に向かうベクトル（飛行機）
      const dirToCenter = new THREE.Vector3();
      dirToCenter.subVectors(this.earth.position, this.plane.position);
      dirToCenter.normalize();

      //目的地へ向かうベクトル（飛行機）
      const dirToDestinaiton = new THREE.Vector3();
      dirToDestinaiton.subVectors(
        this.destination.position,
        this.plane.position
      );

      //引力をかけ合わせる
      const pullStrength = 0.0085; //引力の強さ
      const pullToCenter = dirToCenter.multiplyScalar(pullStrength);
      const pullToDestinaiton = dirToDestinaiton.multiplyScalar(pullStrength);
      //目的地と地球中心に向かうベクトルを加算
      this.plane.position.add(pullToCenter);
      this.plane.position.add(pullToDestinaiton);

      const normalizedPos = this.plane.position.clone().normalize();
      this.plane.position.copy(normalizedPos.multiplyScalar(this.radius - 0.2)); //飛行機の位置を半径に制限
      const newPos = this.plane.position.clone();

      const planeDir = new THREE.Vector3();
      planeDir.subVectors(newPos, prevPos);
      planeDir.normalize(); //飛行機の向き

      //飛行機の向きを槍に向ける
      // const prevDir = this.plane.direction.clone();
      // const dirToDestination = new THREE.Vector3();
      // dirToDestination.subVectors(
      //   this.destination.position,
      //   this.plane.position
      // );
      // dirToDestination.normalize(); //目的地に向くベクトル

      // let normalAxis = new THREE.Vector3();
      // normalAxis.crossVectors(prevDir, dirToDestination);
      // normalAxis.normalize(); //目的地を向くベクトルと前回の飛行機の向きの外積

      // const cos = prevDir.dot(dirToDestination);
      // const radians = Math.acos(cos); //目的地を向くベクトルと飛行機の向きのなす角

      const gravity = new THREE.Vector3();
      gravity.subVectors(this.earth.position, this.plane.position); // 飛行機から地球の中心への逆ベクトル
      const gravityInverse = new THREE.Vector3();
      gravityInverse.subVectors(this.plane.position, this.earth.position); // 飛行機から地球の中心への逆ベクトル

      // 飛行機が向かう方向（前進）を計算
      const forward = new THREE.Vector3();
      forward.subVectors(this.destination.position, this.plane.position);
      forward.normalize();
      const forwardInverse = new THREE.Vector3();
      forwardInverse.subVectors(this.plane.position, this.destination.position);
      forwardInverse.normalize();

      const airplaneDirection = new THREE.Matrix4();
      // airplaneDirection.lookAt(forward, this.earth.position, gravityInverse);
      airplaneDirection.lookAt(planeDir, forwardInverse, gravityInverse);
      //eye（飛行機の目）, target（注視点）, up（上方向）
      //前を向きつつ、飛行機の下側が地球の中心を向く(このプロジェクトで使用している飛行機のモデルは、下側が正面の設計であるため)

      this.plane.setRotationFromMatrix(airplaneDirection);

      // const quaternion = new THREE.Quaternion();
      // quaternion.setFromAxisAngle(normalAxis, radians); //目的地を向くベクトルと飛行機の向きのなす角からクォータニオンを作成

      // const step = 0.5;
      // this.plane.quaternion.slerp(quaternion, step); //飛行機のクォータニオンに掛け合わせる
    }

    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}
