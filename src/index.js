import * as BABYLON from 'babylonjs';
// import './ammo.js';
import 'babylonjs-loaders'
import createCar from "./car";
import {materials} from "./materials";
import create from "./playground";

const canvas = document.getElementById("renderCanvas");
let scene = null;

const createDefaultEngine = () => new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});

const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    // light.intensity = 0.7;

    const camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 1.4, Math.PI / 2.8, 30, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);

    BABYLON.SceneLoader.ImportMesh("", "assets/lamp/", "Evrosvet_GL 1014F_black_gold.obj", scene, function (newMeshes, particleSystems, skeletons) {
        var sun = BABYLON.Mesh.CreateSphere('sun', 16, 2, scene);
        sun.position = new BABYLON.Vector3(-23, 3.5, 15);

        // var materialSphere = new BABYLON.StandardMaterial("sphere1", scene);
        // materialSphere.emissiveColor = new BABYLON.Color3(1.0, 1.0, 0.7);
        // sun.material = materialSphere;

        newMeshes.forEach(i => i.parent = sun);

        sun.scaling = new BABYLON.Vector3(0.005, 0.005, 0.005)

        var light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 0, 0), scene);
        light.range = 300;
        light.parent = sun;

    })

    scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), new BABYLON.AmmoJSPlugin());

    materials.scene = scene;
    materials.createColor('green', '#1C5030');
    materials.createTexture('grass');
    materials.createTexture('tyre2', 'png');

    create(scene);
    const car = createCar(scene);
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
