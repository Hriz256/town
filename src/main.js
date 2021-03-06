import {iconsFrame} from "./playground/playground";
import {createVehicle} from "./cars/car";
import {materials, mesh} from "./playground/materials";
import {createPlayground, createGround} from "./playground/playground";
import {createGarageCars} from './cars/garage';

const load = scene => {
    const assetsManager = new BABYLON.AssetsManager(scene);
    assetsManager.addMeshTask('golf', '', 'assets/', 'golf.gltf');
    assetsManager.addMeshTask('car', '', 'assets/', 'car.gltf');
    assetsManager.addMeshTask('VW', '', 'assets/', 'VW.gltf');
    assetsManager.addMeshTask('bus', '', 'assets/', "bus.gltf");
    assetsManager.addMeshTask('island', '', 'assets/', "cloud.gltf");
    assetsManager.addMeshTask('hole', '', 'assets/', "hole.gltf");

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

    createPlayground(scene, tasks); // Создаём площадку со всеми объектами
    createGarageCars(tasks, scene, canvas, camera);
    createVehicle(scene, camera, tasks[2]); // Создаём машинку
};


window.addEventListener('keyup', (e) => {
    if (e.code === 'Enter') {
        const icon = iconsFrame.find(icon => icon.isPictureChange);

        icon && icon.openSite();
    }
});

export {main};
