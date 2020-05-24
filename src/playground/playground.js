import {materials, mesh} from "./materials";
import '../meshwriter.min';
import {Billboard, createBillboardText} from "./billboardsEnvironment/billboardsEnvironment";
import {billboardsInfo} from "./billboardsEnvironment/billboardsData";
import {createIcons} from "./icons";
import {createFlagsOnBalloons} from './flags';

const createStreetLamp = ({x, z, scene, title}) => {
    BABYLON.SceneLoader.ImportMesh('', 'assets/lamp/', 'StreetLamp.obj', scene, newMeshes => {
        const columnHeight = 9;

        const columnPart2 = mesh.createBox({
            size: new BABYLON.Vector3(1, columnHeight / 2 + 0.6, 0.5),
            position: new BABYLON.Vector3(columnHeight / 4, columnHeight / 2 - 1, 0),
            rotation: new BABYLON.Vector3(Math.PI / 2, -Math.PI / 2, 0),
        });

        const columnPart1 = mesh.createBox({
            size: new BABYLON.Vector3(0.5, columnHeight, 0.5),
            position: new BABYLON.Vector3(x, columnHeight / 2, z),
            rotation: new BABYLON.Vector3(0, -Math.PI / 2, 0),
        });

        columnPart2.parent = columnPart1;

        columnPart2.setPhysics({mass: 5, impostor: 'BoxImpostor'});
        columnPart1.setPhysics({mass: 5, impostor: 'BoxImpostor'});


        newMeshes.forEach(i => {
            i.scaling.set(0.6, 0.6, 0.6);
            i.position.y -= 4.5;
            i.parent = columnPart1
        });

        newMeshes[4].material = materials['lightColor'];
        columnPart1.isVisible = false;
        columnPart2.isVisible = false;

        // const light = new BABYLON.PointLight(title, new BABYLON.Vector3(0, -columnHeight / 4, 1), scene);
        // light.range = 50;
        // light.parent = columnPart2;
    })
};

const createGround = () => {
    const ground = mesh.createGround({
        width: 500,
        height: 500,
        subdivisions: 2,
        position: {x: 0, y: 0, z: 0},
        material: materials['peach']
    });
    // materials['grass'].maxSimultaneousLights = 32;
    // materials['grass'].specularColor = new BABYLON.Color3(.1, .1, .1);

    ground.setPhysics({});
};

const createBench = (scene) => {
    BABYLON.SceneLoader.ImportMesh('', 'assets/environment/', 'classic park bench.obj', scene, newMeshes => {
        const box = new BABYLON.Mesh('', scene);

        newMeshes.forEach(i => {
            i.scaling.set(0.1, 0.1, 0.1);
            i.parent = box;
        });
    });
};

const createPhysicsText = ({text, pos, thickness = 15, scene}) => {
    const scale = 0.1;

    const Type = TYPE(scene, scale);
    const physicsText = new Type(
        `${text}`,
        {
            "anchor": "center",
            "letter-height": 40,
            "letter-thickness": thickness,
            "color": "#1C5030",
            "position": {
                "x": 0,
                "y": 0,
                "z": 0
            }
        }
    );

    const physicsMesh = physicsText.getMesh();

    const vectorsWorld = physicsMesh.getBoundingInfo().boundingBox.vectorsWorld;
    const x = +(vectorsWorld[1].x - vectorsWorld[0].x);
    const y = +(vectorsWorld[1].y - vectorsWorld[0].y);
    const z = +(vectorsWorld[1].z - vectorsWorld[0].z);

    const container = mesh.createBox({
        size: new BABYLON.Vector3(x, y, z),
        position: new BABYLON.Vector3(pos.x - x / 2, pos.y, pos.z),
        rotation: new BABYLON.Vector3(-Math.PI / 2, -Math.PI, 0),
        mass: 2,
        restitution: 0
    });

    container.setPhysics({mass: 10});

    container.isVisible = false;
    physicsMesh.parent = container;
    physicsMesh.position.y += y / 2;
    physicsMesh.position.z -= z / 2;

    return x;
};

let billboardsArray;
let iconsFrame = [];

const createPlayground = scene => {
    createFlagsOnBalloons(scene);
    iconsFrame = createIcons(scene);

    billboardsArray = Array.from(billboardsInfo, (item, index) => {
        const {x, z, size, url, text, width, height, videoURL} = item;

        createStreetLamp({x: x - width - 0.75, z, scene, title: url}); // Фонарь справа от каждого билборда
        index % 2 === 0 && createStreetLamp({x: x + 2.75, z, scene, title: url}); // Фонарь слева от 1 билборда

        text && createBillboardText({x, z: z, y: 0.05, text});

        return new Billboard({
            scene,
            x,
            z,
            size,
            url,
            width,
            height,
            videoURL
        });
    });

    const letters = 'vladislav zhidko'.split('').filter(i => i !== ' ');
    let x = 0;

    letters.forEach(i => {
        const letterWidth = createPhysicsText({
            text: i,
            pos: new BABYLON.Vector3(21 + x, 2.5, 15),
            scene
        });

        x -= letterWidth + 1;
    });

    // createBench()
};

export {billboardsArray, iconsFrame, createPlayground, createGround};
