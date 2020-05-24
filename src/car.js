import {materials, mesh} from "./playground/materials";
import {billboardsArray, iconsFrame} from "./playground/playground";
import {createJoystick} from "./joystick";

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
};

const chassisWidth = 1.8;
const chassisHeight = 1;
const chassisLength = 5.3;
const massVehicle = 400;

const suspensionStiffness = 30; // насколько сильно машина будет проседать при разгоне и торможении
const suspensionDamping = 0.3;
const suspensionCompression = 4.4;
const suspensionRestLength = 0.6;
const rollInfluence = 0.0;

const isMobile = false;

const wheelsNumber = {
    front_left: 0,
    front_right: 1,
    rear_left: 2,
    rear_right: 3
};

const actions = {
    accelerate: false,
    brake: false,
    right: false,
    left: false
};
const keysActions = {
    "KeyW": 'acceleration',
    "KeyS": 'braking',
    "KeyA": 'left',
    "KeyD": 'right'
};

const pcControl = (speed) => {
    if (actions.acceleration) {
        if (speed < -1) {
            car.breakingForce = car.maxBreakingForce;
        } else if (speed >= -1 && speed < 110) {
            car.engineForce = car.maxEngineForce;
        }

    } else if (actions.braking) {
        if (speed > 1) {
            car.breakingForce = car.maxBreakingForce;
        } else if (speed <= 1 && speed > -60) {
            car.engineForce = -car.maxEngineForce;
        }
    }

    if (!actions.acceleration && !actions.braking) {
        speed > 0 ? car.breakingForce = car.maxBreakingForce : car.engineForce = car.maxEngineForce;

        if (speed < 1 && speed > -1) {
            car.engineForce = 0;
        }
    }

    if (actions.right) {
        if (car.vehicleSteering < car.steeringClamp) {
            car.vehicleSteering += car.steeringIncrement;
        }

    } else if (actions.left) {
        if (car.vehicleSteering > -car.steeringClamp) {
            car.vehicleSteering -= car.steeringIncrement;
        }

    } else {
        car.vehicleSteering = 0;
    }
};

const mobileControl = (joystick, speed) => {
    if (joystick.getX()) {
        if (car.vehicleSteering > -car.steeringClamp && car.vehicleSteering < car.steeringClamp) {
            car.vehicleSteering = joystick.getX() / (joystick.getMaxDistance() / car.steeringClamp);
        }
    } else {
        car.vehicleSteering = 0;
    }

    if (joystick.getY() > 0) {
        if (speed > 1) {
            car.breakingForce = (car.maxBreakingForce / joystick.getMaxDistance()) * joystick.getY();
        } else if (speed <= 1 && speed > -60) {
            car.engineForce = (car.maxEngineForce / -joystick.getMaxDistance()) * joystick.getY();
        }
    } else if (joystick.getY() < 0) {
        if (speed < -1) {
            car.breakingForce = (car.maxBreakingForce / -joystick.getMaxDistance()) * joystick.getY();
        } else if (speed >= -1 && speed < 110) {
            car.engineForce = (car.maxEngineForce / -joystick.getMaxDistance()) * joystick.getY();
        }
    } else {
        speed > 0 ? car.breakingForce = car.maxBreakingForce : car.engineForce = car.maxEngineForce;

        if (speed < 1 && speed > -1) {
            car.engineForce = 0;
        }
    }
};

const update = (scene, joystick) => {
    scene.onPointerDown = (evt, pickResult) => {
        const icon = iconsFrame.find(icon => icon.isPictureChange);

        if (icon && icon.frame.intersectsPoint(new BABYLON.Vector3(pickResult.pickedPoint.x, icon.frame.position.y, pickResult.pickedPoint.z))) {
            icon.openSite();
        }
    };


    scene.registerBeforeRender(() => {
        // billboardsArray.filter(i => i.frame).forEach(item => {
        //     if (car.chassisMesh.intersectsMesh(item.frame, false) && !item.isVideoShow &&
        //         (car.chassisMesh.position.x && car.chassisMesh.position.z)) {
        //         item.showVideo();
        //     }
        //
        //     if (!car.chassisMesh.intersectsMesh(item.frame, false) && item.isVideoShow) {
        //         item.hideVideo();
        //     }
        // });
        //
        // Array.from(billboardsArray, item => {
        //     if (car.chassisMesh.intersectsMesh(item.physicsZone, false) && !item.isChangeMass &&
        //         (car.chassisMesh.position.x && car.chassisMesh.position.z)) {
        //         item.setPositiveMass();
        //         item.recreate();
        //     }
        // });
        //
        // Array.from(iconsFrame, icon => {
        //     if (car.chassisMesh.intersectsMesh(icon.frame, false) && !icon.isPictureChange &&
        //         (car.chassisMesh.position.x && car.chassisMesh.position.z)) {
        //         icon.showEnter();
        //     }
        //
        //     if (!car.chassisMesh.intersectsMesh(icon.frame, false) && icon.isPictureChange &&
        //         (car.chassisMesh.position.x && car.chassisMesh.position.z)) {
        //         icon.showEnter();
        //     }
        // });

        const speed = car.vehicle.getCurrentSpeedKmHour();
        car.breakingForce = 0;
        car.engineForce = 0;

        isMobile ? mobileControl(joystick, speed) : pcControl(speed);

        car.vehicle.applyEngineForce(car.engineForce, wheelsNumber.front_left);
        car.vehicle.applyEngineForce(car.engineForce, wheelsNumber.rear_left);

        car.vehicle.setBrake(car.breakingForce / 2, wheelsNumber.front_left);
        car.vehicle.setBrake(car.breakingForce / 2, wheelsNumber.front_right);
        car.vehicle.setBrake(car.breakingForce, wheelsNumber.rear_left);
        car.vehicle.setBrake(car.breakingForce, wheelsNumber.rear_right);

        car.vehicle.setSteeringValue(car.vehicleSteering, wheelsNumber.front_left);
        car.vehicle.setSteeringValue(car.vehicleSteering, wheelsNumber.rear_left);


        let tm, p, q;

        Array.from({length: car.vehicle.getNumWheels()}, (i, index) => {
            car.vehicle.updateWheelTransform(index, true);
            tm = car.vehicle.getWheelTransformWS(index);
            p = tm.getOrigin();
            q = tm.getRotation();
            car.wheelMeshes[index].position.set(p.x(), p.y(), p.z());
            car.wheelMeshes[index].rotationQuaternion.set(q.x(), q.y(), q.z(), q.w());
            car.wheelMeshes[index].rotate(BABYLON.Axis.Z, Math.PI / 2);
        });

        tm = car.vehicle.getChassisWorldTransform();
        p = tm.getOrigin();
        q = tm.getRotation();
        car.chassisMesh.position.set(p.x(), p.y(), p.z());
        car.chassisMesh.rotationQuaternion.set(q.x(), q.y(), q.z(), q.w());
    })
};


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

function createVehicle(scene, camera, {carTask, wheelTask}) {
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
        const {x, y, z} = item.position;

        switch (item.name) {
            case 'Front_wheel_left':
                item.parent = null;
                addWheel(true, new Ammo.btVector3(z, y, x), y, item, wheelsNumber.front_left);
                break;
            case 'Front_wheel_right':
                item.parent = null;
                addWheel(true, new Ammo.btVector3(z, y, x), y, item, wheelsNumber.front_right);
                break;
            case 'Rear_wheel_left':
                item.parent = null;
                addWheel(false, new Ammo.btVector3(z, y, x), y, item, wheelsNumber.rear_left);
                break;
            case 'Rear_wheel_right':
                item.parent = null;
                addWheel(false, new Ammo.btVector3(z, y, x), y, item, wheelsNumber.rear_right);
                break;
            default:
                break;
        }
    });

    const joystick = createJoystick();
    camera.lockedTarget = car.chassisMesh;
    update(scene, joystick);
}

window.addEventListener('keydown', (e) => {
    if (keysActions[e.code]) {
        actions[keysActions[e.code]] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (keysActions[e.code]) {
        actions[keysActions[e.code]] = false;
    }
});

export {createVehicle, car};
