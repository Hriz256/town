import {materials} from "./playground/materials";

const car = {
    vehicle: null,
    wheelMeshes: [],
    vehicleReady: false,
    steeringIncrement: .02,
    steeringClamp: 0.4,
    maxEngineForce: 2000,
    maxBreakingForce: 30,
    engineForce: 0,
    vehicleSteering: 0,
    breakingForce: 0,
    chassisMesh: null,
    front_left: 0,
    front_right: 1,
    back_left: 2,
    back_right: 3
};

let vehicleReady = false;

const chassisWidth = 1.8;
const chassisHeight = .8;
const chassisLength = 4.6;
const massVehicle = 400;

const wheelAxisPositionBack = -1.77;
const wheelRadiusBack = .4;
const wheelWidthBack = .3;
const wheelHalfTrackBack = 0.95;
const wheelAxisHeightBack = 0.42;

const wheelAxisFrontPosition = 1.32;
const wheelHalfTrackFront = 0.95;
const wheelAxisHeightFront = 0.38;
const wheelRadiusFront = .4;
const wheelWidthFront = .3;

const suspensionStiffness = 10;
const suspensionDamping = 0.3;
const suspensionCompression = 4.4;
const suspensionRestLength = 0.6;
const rollInfluence = 0.0;

const headlights = {
    spot: {
        left: null,
        right: null
    },
    point: {
        left: null,
        right: null
    },
    enable: true
};

const createHeadlights = (car, scene) => {
    headlights.spot.left = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(-7, 1, -25), new BABYLON.Vector3(0, 10, -11), Math.PI / 2, 3, scene);
    headlights.spot.left.parent = car;
    headlights.spot.left.intensity = 10;
    // light.diffuse = new BABYLON.Color3(1, 0, 0);

    // mesh_mm10 - задняя фара
    // mesh_mm8 - задняя лампа

    headlights.spot.right = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(6.8, 1, -25), new BABYLON.Vector3(0, 10, -11), Math.PI / 2, 3, scene);
    headlights.spot.right.parent = car;
    headlights.spot.right.intensity = 10;
    // light2.diffuse = new BABYLON.Color3(1, 0, 0);

    headlights.point.left = BABYLON.Mesh.CreateSphere("sun", 32, 1.5, scene);
    headlights.point.left.position = new BABYLON.Vector3(-7, -5, -19.5);
    headlights.point.left.parent = car;
    headlights.point.left.material = materials['white'];

    headlights.point.right = headlights.point.left.clone('rightPointlight');
    headlights.point.right.position = new BABYLON.Vector3(7, -5, -19.5);
};

const enableHeadlights = () => {
    headlights.enable = !headlights.enable;

    Object.values(headlights.spot).forEach(i => i.setEnabled(headlights.enable));
    Object.values(headlights.point).forEach(i => i.isVisible = headlights.enable);
};

// const createCar = ({scene, joystick}) => {
//     car.chassisMesh = createVehicle(new BABYLON.Vector3(0, 4, -20), new BABYLON.Quaternion(), scene);
// };

const createChassisMesh = (w, l, h, scene) => {
    const mesh = new BABYLON.MeshBuilder.CreateBox("box", {width: w, depth: h, height: l}, scene);
    mesh.rotationQuaternion = new BABYLON.Quaternion();
    mesh.material = materials['green'];

    return mesh;
};

function createVehicle(scene) {
    const quat = new BABYLON.Quaternion();
    const wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
    const wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

    car.chassisMesh = createChassisMesh(chassisWidth, chassisHeight, chassisLength);

    const physicsWorld = scene.getPhysicsEngine().getPhysicsPlugin().world;
    const localInertia = new Ammo.btVector3(0, 0, 0);

    const geometry = new Ammo.btBoxShape(new Ammo.btVector3(chassisWidth * .5, chassisHeight * .5, chassisLength * .5));
    geometry.calculateLocalInertia(massVehicle, localInertia);

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(0, 5, 0));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

    const massOffset = new Ammo.btVector3(0, 0.4, 0);
    const transform2 = new Ammo.btTransform();
    transform2.setIdentity();
    transform2.setOrigin(massOffset);

    const motionState = new Ammo.btDefaultMotionState(transform);

    const compound = new Ammo.btCompoundShape();
    compound.addChildShape(transform2, geometry);

    const body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(massVehicle, motionState, compound, localInertia));
    body.setActivationState(4);

    function collisionCallbackFunc(cp, colObj0, colObj1) {
        // Array.from(billboardsArray, item => {
        //     const isFind = item.walls.find(i => i.physicsImpostor.physicsBody.ptr === colObj1);
        //
        //     if (!item.isChangeMass && isFind) {
        //         item.setPositiveMass();
        //         item.recreate();
        //     }
        // });
    }

    physicsWorld.setContactProcessedCallback(Ammo.addFunction(collisionCallbackFunc));
    physicsWorld.addRigidBody(body);

    const tuning = new Ammo.btVehicleTuning();
    const rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld);
    car.vehicle = new Ammo.btRaycastVehicle(tuning, body, rayCaster);
    car.vehicle.setCoordinateSystem(0, 1, 2);
    physicsWorld.addAction(car.vehicle);

    function addWheel(isFront, pos, radius, width, index) {
        const wheelInfo = car.vehicle.addWheel(
            pos,
            wheelDirectionCS0,
            wheelAxleCS,
            suspensionRestLength,
            radius,
            tuning,
            isFront);

        wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
        wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
        wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);
        wheelInfo.set_m_maxSuspensionForce(600000);
        wheelInfo.set_m_frictionSlip(40);
        wheelInfo.set_m_rollInfluence(rollInfluence);

        car.wheelMeshes[index] = createWheelMesh(radius, width, scene);
    }

    const assetsManager = new BABYLON.AssetsManager(scene);
    const meshTask = assetsManager.addMeshTask("car task", "", "assets/", "car.obj");

    meshTask.onSuccess = function ({loadedMeshes}) {
        const carBody = new BABYLON.Mesh("main", scene);

        Array.from(loadedMeshes, item => {
            item.position.y = 3;
            item.position.x = 0.2;
            item.parent = carBody;
        });

        // scene.getMeshByName('wheel_lf_pivot').dispose();
        //
        // loadedMeshes[96].dispose();
        // loadedMeshes[97].dispose();
        // loadedMeshes[99].dispose();
        // loadedMeshes[100].dispose();
        // loadedMeshes[102].dispose();
        // loadedMeshes[103].dispose();
        // loadedMeshes[104].dispose();
        // loadedMeshes[106].dispose();
        // loadedMeshes[107].dispose();

        carBody.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
        carBody.parent = car.chassisMesh;

        createHeadlights(carBody, scene);

        car.chassisMesh.isVisible = false;

        addWheel(true, new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, car.front_left);
        addWheel(true, new Ammo.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, car.front_right);
        addWheel(false, new Ammo.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, car.back_left);
        addWheel(false, new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, car.back_right);

        vehicleReady = true;
    };

    assetsManager.load();

    return car.chassisMesh;
}

function createWheelMesh(radius, width, scene) {
    const faceColors = [];
    faceColors[1] = new BABYLON.Color3(0, 0, 0);

    const faceUV = [];
    faceUV[0] = new BABYLON.Vector4(0, 0, 1, 1);
    faceUV[2] = new BABYLON.Vector4(0, 0, 1, 1);

    const mesh = new BABYLON.MeshBuilder.CreateCylinder("Wheel", {
        diameter: 0.85,
        height: 0.3,
        tessellation: 24,
        faceColors: faceColors,
        faceUV: faceUV
    }, scene);
    // mesh.isVisible = false;
    mesh.rotationQuaternion = new BABYLON.Quaternion();
    mesh.material = materials.createTexture('tyre2', 'png');

    return mesh;
}

window.addEventListener('keyup', e => {
    e.code === 'KeyL' && enableHeadlights();
});


export {createVehicle, car};
