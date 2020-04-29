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

    BABYLON.SceneLoader.ImportMesh("", "assets/lamp/", "StreetLamp.obj", scene, function (newMeshes, particleSystems, skeletons) {
        const lamp = new BABYLON.Mesh("lamp", scene);

        scene.getMeshByName('Plane_Plane.001').dispose();

        newMeshes.forEach(i => i.parent = lamp);
        lamp.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
        lamp.position = new BABYLON.Vector3(-22, 3.5, 15);
        lamp.rotation.y -= Math.PI / 2;

        const light1 = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 0, 0), scene);
        light1.range = 200;
        light1.parent =  newMeshes[0];

        const light2 = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 0, 0), scene);
        light2.range = 200;
        light2.parent =  newMeshes[1];

        const light3 = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 0, 0), scene);
        light3.range = 200;
        light3.parent =  newMeshes[2];

        const light4 = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 0, 0), scene);
        light4.range = 200;
        light4.parent =  newMeshes[3];

        const light5 = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 0, 0), scene);
        light5.range = 200;
        light5.parent =  newMeshes[4];
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
