import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import './index.css';
import './preloader';
import {main} from "./main";

const canvas = document.getElementById("renderCanvas");
const createDefaultEngine = () => new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});

const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // const bottomLight = new BABYLON.HemisphericLight("bottomLight", new BABYLON.Vector3(0, -10, 0), scene);
    // bottomLight.intensity = 1;

    const upLight = new BABYLON.HemisphericLight("upLight", new BABYLON.Vector3(0, 10, 0), scene);
    upLight.intensity = 1;


    const camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2.8, 30, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);

    scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), new BABYLON.AmmoJSPlugin());

    // const plugin = scene.getPhysicsEngine().getPhysicsPlugin();
    // plugin.setTimeStep(1/10);
    //
    // plugin.setFixedTimeStep(1/10);
    //
    // plugin.setMaxSteps(10);

    main({scene, camera});

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
