import * as BABYLON from 'babylonjs';
// import './ammo.js';
import 'babylonjs-loaders'
import createCar from "./car";
import {materials, mesh} from "./playground/materials";
import create from "./playground/playground";

const canvas = document.getElementById("renderCanvas");
let scene = null;

const createDefaultEngine = () => new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});

const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    // light.intensity = 0.7;

    const camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2.8, 30, new BABYLON.Vector3(0, 0, 0), scene);
    // camera.attachControl(canvas, true);

    scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), new BABYLON.AmmoJSPlugin());

    mesh.scene = scene;
    materials.scene = scene;
    materials.createColor('green', '#1C5030');
    materials.createColor('lightColor', '#feff7f');
    materials.createColor('white', '#ffffff');
    materials.createTexture('grass');

    materials.createTexture('icons/enter', 'png');
    materials['icons/enter'].diffuseTexture.hasAlpha = true;

    materials.createTexture('tyre2', 'png');

    create(scene);
    const car = createCar({scene, engine, camera});
    camera.lockedTarget = car;


    // const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
    // camera.radius = 10;
    // camera.heightOffset = 4;
    // camera.rotationOffset = 0;
    // camera.cameraAcceleration = 0.05;
    // camera.maxCameraSpeed = 400;
    // camera.lockedTarget = car;
    // scene.activeCamera = camera;

    return scene;
};

const engine = createDefaultEngine();
scene = createScene();

if (!engine) throw 'engine should not be null.';

engine.runRenderLoop(() => scene && scene.render());
engine.loadingUIBackgroundColor = "Purple";
window.addEventListener("resize", () => engine.resize());
