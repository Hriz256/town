import {iconsFrame} from "./playground/playground";
import {createVehicle} from "./cars/car";
import {materials, mesh} from "./playground/materials";
import {createPlayground, createGround} from "./playground/playground";
import {createGarageCars} from './cars/garage';

const load = scene => {
    const assetsManager = new BABYLON.AssetsManager(scene);
    assetsManager.addMeshTask('golf task', '', 'assets/', 'golf.gltf');
    assetsManager.addMeshTask('car task', '', 'assets/', 'car.gltf');
    assetsManager.addMeshTask('VW task', '', 'assets/', 'VW.gltf');
    assetsManager.addMeshTask('bus task', '', 'assets/', "bus.gltf");
    assetsManager.addMeshTask('island task', '', 'assets/', "island.gltf");

    assetsManager.load();

    return new Promise(resolve => {
        assetsManager.onFinish = tasks => resolve(tasks);
    });
};

const main = async ({scene, camera, canvas}) => {
    const tasks = await load(scene);

    mesh.scene = scene;

    materials.scene = scene;
    materials.createTexture('icons/enter', 'png');
    materials['icons/enter'].diffuseTexture.hasAlpha = true;

    materials.setColors();

    // createPlayground(scene); // Создаём площадку со всеми объектами
    createGround();
    createGarageCars(tasks, scene, canvas);
    // createVehicle(scene, camera, {golf: tasks[0], car: tasks[1], VW: tasks[2]}); // Создаём машинку
};


window.addEventListener('keyup', (e) => {
    if (e.code === 'Enter') {
        const icon = iconsFrame.find(icon => icon.isPictureChange);

        icon && icon.openSite();
    }
});

export {main};
