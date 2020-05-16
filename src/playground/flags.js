import {materials, mesh} from "./materials";

const flags = {
    'belarus': {
        position: {
            x: 0,
            y: 10,
            z: 10
        },
        width: 8,
        height: 4,
    },
    'russian': {
        position: {
            x: 10,
            y: 10,
            z: 10
        },
        width: 8,
        height: 4,
    }
};

const createFlag = (flag, scene) => {
    BABYLON.SceneLoader.ImportMesh('', 'assets/environment/', 'balloon.obj', scene, newMeshes => {
        const {position, width, height} = flag[1];
        const balloon = new BABYLON.Mesh('', scene);

        Array.from(newMeshes, item => {
            item.parent = balloon;
            item.material =  materials.createTexture(
                `environment/${flag[0]}Pattern`,
                `${flag[0] === 'russian' ? 'jpg' : 'png' }`
            );
        });

        balloon.scaling.set(0.5, 0.5, 0.5);
        balloon.position.set(position.x - width / 2, position.y + height / 2, position.z);

        const balloon2 = balloon.clone('newBalloon');
        balloon2.position.x = position.x + width / 2;

        const flagMaterial = materials.createTexture(`environment/${flag[0]}Flag`);
        flagMaterial.backFaceCulling = false;

        const flagPlane = mesh.createGround({
            width,
            height,
            position,
            rotation: {x: -Math.PI / 2, y: Math.PI, z: 0},
            material: flagMaterial
        });

        flagPlane.physicsImpostor = new BABYLON.PhysicsImpostor(flagPlane, BABYLON.PhysicsImpostor.ClothImpostor, {
            mass: 0,
            fixedPoints: 15,
            margin: 0.45
        }, scene);

        flagPlane.physicsImpostor.pressure = 3000;
        flagPlane.physicsImpostor.velocityIterations = flagPlane.physicsImpostor.positionIterations = 10;
        flagPlane.physicsImpostor.stiffness = 1;
    })
};

const createFlagsOnBalloons = scene => Array.from(Object.entries(flags), icon => createFlag(icon, scene));

export {createFlagsOnBalloons};
