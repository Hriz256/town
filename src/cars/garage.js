import * as GUI from 'babylonjs-gui';
import {mesh} from "../playground/materials";
import {interfaces} from '../playground/interface';
import {vehicles} from "./carsData";

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
        url: 'assets/previous.png',
        thickness: 0,
        width: '100px',
        height: '100px',
        left: '50px',
        hAl: 'HORIZONTAL_ALIGNMENT_LEFT'
    });
    toggleLeft.alpha = 0.6;
    toggleLeft.isEnabled = false;

    const toggleRight = interfaces.createImgButton({
        url: 'assets/next.png',
        thickness: 0,
        width: '100px',
        height: '100px',
        left: '-50px',
        hAl: 'HORIZONTAL_ALIGNMENT_RIGHT'
    });

    Array.from([title, toggleLeft, toggleRight], item => advancedTexture.addControl(item));

    return {
        getLeftBtn() {
            return toggleLeft;
        },

        getRightBtn() {
            return toggleRight;
        },

        removeItems() {
            Array.from([title, toggleLeft, toggleRight], item => advancedTexture.removeControl(item));
        },

        enableBtn(btn, allow) {
            btn.isEnabled = !!allow;
            btn.alpha = allow ? 1 : 0.6;
        },
    }
};

const rotateVehicleByPointer = (scene, canvas, mesh) => {
    const currentPosition = {x: 0, y: 0};
    const currentRotation = {x: 0, y: 0};
    const lastAngleDiff = {x: 0, y: 0};
    const oldAngle = {x: 0, y: 0};
    const newAngle = {x: 0, y: 0};
    let vehicle = mesh;
    let clicked = false;
    let mousemove = false;
    let frameCount = 0;
    let maxFrameCount = 120;

    scene.beforeRender = () => mousemove = false;

    scene.afterRender = () => {
        if (!mousemove && frameCount < maxFrameCount) {
            lastAngleDiff.x = lastAngleDiff.x / 1.1;
            lastAngleDiff.y = lastAngleDiff.y / 1.1;

            vehicle.rotation.x += lastAngleDiff.x;
            vehicle.rotation.y += lastAngleDiff.y;

            frameCount++;
            currentRotation.x = vehicle.rotation.x;
            currentRotation.y = vehicle.rotation.y;
        } else if (frameCount >= maxFrameCount) {
            frameCount = 0;
        }
    };

    canvas.addEventListener('pointerdown', evt => {
        currentPosition.x = evt.clientX;
        currentPosition.y = evt.clientY;
        currentRotation.x = vehicle.rotation.x;
        currentRotation.y = vehicle.rotation.y;
        clicked = true;
    });

    canvas.addEventListener('pointermove', evt => {
        if (clicked) {
            mousemove = true;
        }

        if (!clicked) {
            return;
        }

        oldAngle.x = vehicle.rotation.x;
        oldAngle.y = vehicle.rotation.y;

        vehicle.rotation.y -= (evt.clientX - currentPosition.x) / 300.0;

        newAngle.x = vehicle.rotation.x;
        newAngle.y = vehicle.rotation.y;

        lastAngleDiff.x = newAngle.x - oldAngle.x;
        lastAngleDiff.y = newAngle.y - oldAngle.y;
        currentPosition.x = evt.clientX;
        currentPosition.y = evt.clientY;
    });

    canvas.addEventListener('pointerup', () => clicked = false);

    return (mesh) => vehicle = mesh;
};

const createModel = (task, getIslandInstance, index, step) => {
    const carBody = mesh.createBox({
        size: {x: 1, y: 1, z: 1},
        position: {x: -index * step, y: 0, z: 0},
    });
    carBody.isVisible = false;

    const {x, y, z} = vehicles[task.name].islandPosition;

    task.loadedMeshes[0].rotationQuaternion = null;
    task.loadedMeshes[0].position.set(x, y, z);
    task.loadedMeshes[0].rotation.set(0, Math.PI / -2, 0);
    task.loadedMeshes[0].parent = carBody;

    getIslandInstance().parent = carBody;

    return carBody;
};

const createIsland = (islandNode) => {
    islandNode.getChildren()[0].isVisible = false;

    return () => {
        const island = islandNode.clone('newIsland');
        island.getChildren()[0].isVisible = true;

        return island;
    };
};

const run = (scene, vehicle, isLeft, step) => {
    const frame = 60;
    const xSlide = new BABYLON.Animation('xSlide', 'position.x', frame, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE);

    const keyFramesP = [
        {
            frame: 0,
            value: vehicle.position.x
        },
        {
            frame,
            value: isLeft ? vehicle.position.x - step : vehicle.position.x + step
        }
    ];

    xSlide.setKeys(keyFramesP);
    vehicle.animations.push(xSlide);
    scene.beginAnimation(vehicle, 0, frame, false);
};

const shiftAllVehicles = (scene, vehicles, isLeft, step) => {
    Array.from(vehicles, vehicle => run(scene, vehicle, isLeft, step));
};

const createGarageCars = (tasks, scene, canvas) => {
    const step = 60;
    const getIslandInstance = createIsland(tasks[4].loadedMeshes[0]);
    const vehicles = Array.from(tasks.slice(0, -1), (task, index) => createModel(task, getIslandInstance, index, step));
    let currentVehicleNumber = 0;

    const changeVehicle = rotateVehicleByPointer(scene, canvas, vehicles[currentVehicleNumber]);
    const interfaceWindow = createInterface(vehicles);

    interfaceWindow.getLeftBtn().onPointerUpObservable.add(function () {
        if (currentVehicleNumber > 0) {
            interfaceWindow.enableBtn(interfaceWindow.getRightBtn(), true);
            changeVehicle(vehicles[--currentVehicleNumber]);
            shiftAllVehicles(scene, vehicles, true, step);
        }

        !currentVehicleNumber && interfaceWindow.enableBtn(this, false);
    });

    interfaceWindow.getRightBtn().onPointerUpObservable.add(function () {
        if (currentVehicleNumber < vehicles.length - 1) {
            interfaceWindow.enableBtn(interfaceWindow.getLeftBtn(), true);
            changeVehicle(vehicles[++currentVehicleNumber]);
            shiftAllVehicles(scene, vehicles, false, step);
        }

        currentVehicleNumber === vehicles.length - 1 && interfaceWindow.enableBtn(this, false);
    });
};

export {createGarageCars};
