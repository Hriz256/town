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
const chassisHeight = 1;
const chassisLength = 5.3;
const massVehicle = 400;

const wheelRadiusBack = .5;
const wheelAxisHeightBack = 0.5;

const wheelRadiusFront = .5;
const wheelAxisHeightFront = 0.5;

const suspensionStiffness = 30; // насколько сильно машина будет проседать при разгоне и торможении
const suspensionDamping = 0.3;
const suspensionCompression = 4.4;
const suspensionRestLength = 0.6;
const rollInfluence = 0.0;


const createCarBody = (scene) => {
    car.chassisMesh = mesh.createBox({
        size: {x: chassisWidth, y: chassisHeight, z: chassisLength},
        position: {x: 0, y: 0, z: 0},
        material: materials['green']
    });
    car.chassisMesh.rotationQuaternion = new BABYLON.Quaternion();
    // car.chassisMesh.isVisible = false;

    scene.getMeshByName('__root__').rotationQuaternion = null;
    scene.getMeshByName('__root__').rotation.set(0, Math.PI / -2, 0);
    scene.getMeshByName('__root__').parent = car.chassisMesh;
};

function createVehicle(scene, {carTask, wheelTask}) {
    const quat = new BABYLON.Quaternion();
    const wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
    const wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

    const physicsWorld = scene.getPhysicsEngine().getPhysicsPlugin().world;
    const localInertia = new Ammo.btVector3(0, 0, 0);

    const geometry = new Ammo.btBoxShape(new Ammo.btVector3(chassisWidth * .5, chassisHeight * .5, chassisLength * .5));
    geometry.calculateLocalInertia(massVehicle, localInertia);

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(0, 10, 0));
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
            isFront
        );

        wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
        wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
        wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);
        wheelInfo.set_m_maxSuspensionForce(600000);
        wheelInfo.set_m_frictionSlip(40);
        wheelInfo.set_m_rollInfluence(rollInfluence);

        car.wheelMeshes[index] = wheel;
    };


    createCarBody(scene);

    Array.from(scene.getMeshByName('__root__').getChildren(), item => {
        switch (item.name) {
            case 'Front_wheel':
                item.parent = null;
                addWheel(true, new Ammo.btVector3(item.position.z, wheelAxisHeightFront, item.position.x), wheelRadiusFront, item, car.front_left);
                break;
            case 'Front_wheel.001':
                item.parent = null;
                addWheel(false, new Ammo.btVector3(item.position.z, wheelAxisHeightFront, item.position.x), wheelRadiusFront, item, car.back_left);
                break;
            case 'Rear_wheel':
                item.parent = null;
                addWheel(true, new Ammo.btVector3(item.position.z, wheelAxisHeightBack, item.position.x), wheelRadiusBack, item, car.front_right);
                break;
            case 'Rear_wheel.001':
                item.parent = null;
                addWheel(false, new Ammo.btVector3(item.position.z, wheelAxisHeightBack, item.position.x), wheelRadiusBack, item, car.back_right);
                break;
            default:
                break;
        }
    });


    car.vehicleReady = true;

    return car.chassisMesh;
}

export {createVehicle, car};
