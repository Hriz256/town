import * as GUI from 'babylonjs-gui';
import {mesh} from "../playground/materials";
import {interfaces} from '../playground/interface';

let currentVehicleNumber = 0;
let currentVehicle = null;

const createInterface = () => {
    const advancedTexture = new GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');

    const title = interfaces.createText({
        height: '40px',
        text: 'ВЫБЕРИТЕ МАШИНКУ',
        top: '40px',
        fontSize: '40px',
        vAl: 'VERTICAL_ALIGNMENT_TOP'
    });

    const toggleLeft = interfaces.createImgButton({
        url: 'assets/next.png',
        thickness: 0,
        width: '100px',
        height: '100px',
        left: '50px',
        hAl: 'HORIZONTAL_ALIGNMENT_LEFT'
    });

    const toggleRight = interfaces.createImgButton({
        url: 'assets/next.png',
        thickness: 0,
        width: '100px',
        height: '100px',
        left: '-50px',
        hAl: 'HORIZONTAL_ALIGNMENT_RIGHT'
    });


    Array.from([title, toggleLeft, toggleRight], item => advancedTexture.addControl(item));
};

const rotateVehicleByPointer = (scene, canvas) => {
    const currentPosition = {x: 0, y: 0};
    const currentRotation = {x: 0, y: 0};
    const lastAngleDiff = {x: 0, y: 0};
    const oldAngle = {x: 0, y: 0};
    const newAngle = {x: 0, y: 0};
    let clicked = false;
    let mousemove = false;
    let frameCount = 0;
    let maxFrameCount = 120;

    scene.beforeRender = () => mousemove = false;

    scene.afterRender = () => {
        if (!mousemove && frameCount < maxFrameCount) {
            lastAngleDiff.x = lastAngleDiff.x / 1.1;
            lastAngleDiff.y = lastAngleDiff.y / 1.1;

            currentVehicle.rotation.x += lastAngleDiff.x;
            currentVehicle.rotation.y += lastAngleDiff.y;

            frameCount++;
            currentRotation.x = currentVehicle.rotation.x;
            currentRotation.y = currentVehicle.rotation.y;
        } else if (frameCount >= maxFrameCount) {
            frameCount = 0;
        }
    };

    canvas.addEventListener('pointerdown', evt => {
        currentPosition.x = evt.clientX;
        currentPosition.y = evt.clientY;
        currentRotation.x = currentVehicle.rotation.x;
        currentRotation.y = currentVehicle.rotation.y;
        clicked = true;
    });

    canvas.addEventListener('pointermove', evt => {
        if (clicked) {
            mousemove = true;
        }

        if (!clicked) {
            return;
        }

        oldAngle.x = currentVehicle.rotation.x;
        oldAngle.y = currentVehicle.rotation.y;

        currentVehicle.rotation.y -= (evt.clientX - currentPosition.x) / 300.0;

        newAngle.x = currentVehicle.rotation.x;
        newAngle.y = currentVehicle.rotation.y;

        lastAngleDiff.x = newAngle.x - oldAngle.x;
        lastAngleDiff.y = newAngle.y - oldAngle.y;
        currentPosition.x = evt.clientX;
        currentPosition.y = evt.clientY;
    });

    canvas.addEventListener('pointerup', () => clicked = false);
};

const createModel = (task, index) => {
    const carBody = mesh.createBox({
        size: {x: 5, y: 1, z: 5},
        position: {x: !index ? index : 1000, y: 0, z: 0},
    });
    // carBody.isVisible = false;

    task.loadedMeshes[0].rotationQuaternion = null;
    task.loadedMeshes[0].rotation.set(0, Math.PI / -2, 0);
    task.loadedMeshes[0].parent = carBody;

    return carBody;
};

const createGarageCars = (tasks, scene, canvas) => {
    const vehicles = Array.from(tasks, (task, index) => createModel(task, index));
    currentVehicle = vehicles[0];

    rotateVehicleByPointer(scene, canvas);
    createInterface();
};

export {createGarageCars};
