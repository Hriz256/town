import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import './index.css';
import './preloader';
import {main} from "./main";

const canvas = document.getElementById("renderCanvas");
const createDefaultEngine = () => new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3.FromHexString('#ffe5b4');

    // const bottomLight = new BABYLON.HemisphericLight("bottomLight", new BABYLON.Vector3(0, -10, 0), scene);
    // bottomLight.intensity = 1;

    const upLight = new BABYLON.HemisphericLight("upLight", new BABYLON.Vector3(0, 10, 0), scene);
    upLight.specular = new BABYLON.Color3(0,0,0); // убрать блики
    upLight.intensity = 1;

    const camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2.5, 30, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    // camera.inputs.remove(camera.inputs.attached.keyboard);
    // camera.inputs.remove(camera.inputs.attached.pointers);

    // camera.lowerRadiusLimit = 20;
    // camera.upperRadiusLimit = 50;

    scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), new BABYLON.AmmoJSPlugin());

    // const plugin = scene.getPhysicsEngine().getPhysicsPlugin();
    // plugin.setTimeStep(1/10);
    //
    // plugin.setFixedTimeStep(1/10);
    //
    // plugin.setMaxSteps(10);

    main({scene, camera, canvas});

    return scene;
};

const engine = createDefaultEngine();
const scene = createScene();

if (!engine) throw 'engine should not be null.';

engine.runRenderLoop(() => {
    scene && scene.render();
    document.getElementById('fps').innerHTML = `${engine.getFps().toFixed()} fps`;
});
window.addEventListener("resize", () => engine.resize());
