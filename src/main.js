import {iconsFrame} from "./playground/playground";
import {createVehicle} from "./car";
import {materials, mesh} from "./playground/materials";
import {createPlayground, createGround} from "./playground/playground";

const load = scene => {
    const assetsManager = new BABYLON.AssetsManager(scene);
    assetsManager.addMeshTask("car task", "", "assets/", "bus.gltf");

    assetsManager.load();

    return new Promise(resolve => {
        assetsManager.onFinish = tasks => resolve(tasks);
    });
};

const main = async ({scene, camera}) => {
    const tasks = await load(scene);

    mesh.scene = scene;

    materials.scene = scene;
    materials.createTexture('icons/enter', 'png');
    materials['icons/enter'].diffuseTexture.hasAlpha = true;

    materials.setColors();

    // createPlayground(scene); // Создаём площадку со всеми объектами
    createGround();
    createVehicle(scene, camera, {carTask: tasks[0]}); // Создаём машинку
};


window.addEventListener('keyup', (e) => {
    if (e.code === 'Enter') {
        const icon = iconsFrame.find(icon => icon.isPictureChange);

        icon && icon.openSite();
    }
});

export {main};
