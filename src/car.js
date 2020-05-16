import {materials, mesh} from "./playground/materials";

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

const chassisWidth = 1.8;
const chassisHeight = .8;
const chassisLength = 5.3;
const massVehicle = 400;

const wheelAxisPositionBack = -1.47; // расположение оси задних колёс
const wheelRadiusBack = .4;
const wheelHalfTrackBack = 0.95;
const wheelAxisHeightBack = 0.4;

const wheelAxisFrontPosition = 1.62; // расположение оси передних колёс
const wheelRadiusFront = .4;
const wheelHalfTrackFront = 0.95;
const wheelAxisHeightFront = 0.4;

const suspensionStiffness = 30; // насколько сильно машина будет проседать при разгоне и торможении
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
    headlights.spot.left = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(-0.7, 0, -2.5), new BABYLON.Vector3(0, 10, -11), Math.PI / 2, 3, scene);
    headlights.spot.left.parent = car;
    headlights.spot.left.intensity = 10;
    // light.diffuse = new BABYLON.Color3(1, 0, 0);

    headlights.spot.right = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(0.68, 0, -2.5), new BABYLON.Vector3(0, 10, -11), Math.PI / 2, 3, scene);
    headlights.spot.right.parent = car;
    headlights.spot.right.intensity = 10;
    // light2.diffuse = new BABYLON.Color3(1, 0, 0);

    headlights.point.left = mesh.createSphere({
        diameter: 0.1,
        position: {x: -0.7, y: -0.29, z: -1.96},
        material: materials['white']
    });
    headlights.point.left.parent = car;

    headlights.point.right = headlights.point.left.clone('rightPointlight');
    headlights.point.right.position.set(0.68, -0.29, -1.96);
};

const enableHeadlights = () => {
    headlights.enable = !headlights.enable;

    Object.values(headlights.spot).forEach(i => i.setEnabled(headlights.enable));
    Object.values(headlights.point).forEach(i => i.isVisible = headlights.enable);
};

function createVehicle(scene) {
    const quat = new BABYLON.Quaternion();
    const wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
    const wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

    car.chassisMesh = mesh.createBox({
        size: {x: chassisWidth, y: chassisHeight, z: chassisLength},
        position: {x: 0, y: -4, z: 0},
        material: materials['green']
    });
    car.chassisMesh.rotationQuaternion = new BABYLON.Quaternion();
    car.chassisMesh.isVisible = false;

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

    const addWheel = (isFront, pos, radius, wheel, index) => {
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

        car.wheelMeshes[index] = wheel;
    };

    const assetsManager = new BABYLON.AssetsManager(scene);
    const meshTask = assetsManager.addMeshTask("car task", "", "assets/", "car.obj");
    const wheelTask = assetsManager.addMeshTask("wheel task", "", "assets/", "wheel.gltf");

    meshTask.onSuccess = ({loadedMeshes}) => {
        Array.from(loadedMeshes, item => {
            item.position.set(0.02, 0.5, -0.3);
            item.parent = car.chassisMesh;
            item.scaling.set(0.1, 0.1, 0.1);
        });

        createHeadlights(car.chassisMesh, scene);
    };

    wheelTask.onSuccess = ({loadedMeshes}) => {
        const frontLeft = new BABYLON.Mesh('wheel', scene);
        Array.from(loadedMeshes, item => {
            item.parent = frontLeft;
            item.rotation.z = Math.PI / 2;
            item.scaling.set(0.05, 0.05, 0.05);
        });
        frontLeft.rotationQuaternion = new BABYLON.Quaternion();

        const frontRight = frontLeft.clone('wheel2');
        const backLeft = frontLeft.clone('wheel3');
        const backRight = frontLeft.clone('wheel4');

        Array.from([...backRight.getChildren(), ...frontLeft.getChildren()], item => item.rotation.z = Math.PI / -2);

        addWheel(true, new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, frontLeft, car.front_left);
        addWheel(true, new Ammo.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, frontRight, car.front_right);
        addWheel(false, new Ammo.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, backLeft, car.back_left);
        addWheel(false, new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, backRight, car.back_right);
    };

    assetsManager.load();

    return car.chassisMesh;
}

window.addEventListener('keyup', e => e.code === 'KeyL' && enableHeadlights());

export {createVehicle, car};
