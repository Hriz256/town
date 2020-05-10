import * as BABYLON from 'babylonjs';
import {materials} from "./playground/materials";
import {billboardsArray, iconsFrame} from './playground/playground';

var vehicle;
var wheelMeshes = [];
const actions = {accelerate: false, brake: false, right: false, left: false};

const keysActions = {
    "KeyW": 'acceleration',
    "KeyS": 'braking',
    "KeyA": 'left',
    "KeyD": 'right'
};

var vehicleReady = false;

var ZERO_QUATERNION = new BABYLON.Quaternion();

var chassisWidth = 1.8;
var chassisHeight = .8;
var chassisLength = 4.6;
var massVehicle = 400;

var wheelAxisPositionBack = -1.77;
var wheelRadiusBack = .4;
var wheelWidthBack = .3;
var wheelHalfTrackBack = 0.95;
var wheelAxisHeightBack = 0.42;

var wheelAxisFrontPosition = 1.32;
var wheelHalfTrackFront = 0.95;
var wheelAxisHeightFront = 0.38;
var wheelRadiusFront = .4;
var wheelWidthFront = .3;

var suspensionStiffness = 10;
var suspensionDamping = 0.3;
var suspensionCompression = 4.4;
var suspensionRestLength = 0.6;
var rollInfluence = 0.0;

var steeringIncrement = .02;
var steeringClamp = 0.4;
var maxEngineForce = 2000;
var maxBreakingForce = 20;

var FRONT_LEFT = 0;
var FRONT_RIGHT = 1;
var BACK_LEFT = 2;
var BACK_RIGHT = 3;

var engineForce = 0;
var vehicleSteering = 0;
var breakingForce = 0;

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

const createCar = ({scene}) => {
    const chassisMesh = createVehicle(new BABYLON.Vector3(0, 4, -20), ZERO_QUATERNION, scene);

    scene.onPointerDown = (evt, pickResult) => {
        const icon = iconsFrame.find(icon => icon.isPictureChange);

        if (icon && icon.frame.intersectsPoint(new BABYLON.Vector3(pickResult.pickedPoint.x, icon.frame.position.y, pickResult.pickedPoint.z))) {
            icon.openSite();
        }
    };

    scene.registerBeforeRender(function () {
        billboardsArray.filter(i => i.frame).forEach(item => {
            if (chassisMesh.intersectsMesh(item.frame, false) && !item.isVideoShow &&
                (chassisMesh.position.x !== 0 && chassisMesh.position.z !== 0)) {
                item.showVideo();
            }

            if (!chassisMesh.intersectsMesh(item.frame, false) && item.isVideoShow) {
                item.hideVideo();
            }
        });

        Array.from(iconsFrame, icon => {
            if (chassisMesh.intersectsMesh(icon.frame, false) && !icon.isPictureChange &&
                (chassisMesh.position.x !== 0 && chassisMesh.position.z !== 0)) {
                icon.showEnter();
            }

            if (!chassisMesh.intersectsMesh(icon.frame, false) && icon.isPictureChange &&
                (chassisMesh.position.x !== 0 && chassisMesh.position.z !== 0)) {
                icon.showEnter();
            }
        });


        if (vehicleReady) {
            let speed = vehicle.getCurrentSpeedKmHour();
            breakingForce = 0;
            engineForce = 0;

            if(actions.acceleration){
                if (speed < -1){
                    breakingForce = maxBreakingForce;
                } else if (speed >= -1 && speed < 110){
                    engineForce = maxEngineForce;
                }

            } else if(actions.braking){
                if (speed > 1){
                    breakingForce = maxBreakingForce;
                }else if (speed <= 1 && speed > -60) {
                    engineForce = -maxEngineForce ;
                }
            }

            if (!actions.acceleration && !actions.braking) {
                speed > 0 ? breakingForce = maxBreakingForce : engineForce = maxEngineForce;

                if (speed < 1 && speed > -1) {
                    engineForce = 0;
                }
            }

            if(actions.right){
                if (vehicleSteering < steeringClamp){
                    vehicleSteering += steeringIncrement;
                }

            } else if(actions.left){
                if (vehicleSteering > -steeringClamp){
                    vehicleSteering -= steeringIncrement;
                }

            } else {
                vehicleSteering = 0;
            }

            vehicle.applyEngineForce(engineForce, FRONT_LEFT);
            vehicle.applyEngineForce(engineForce, FRONT_RIGHT);

            vehicle.setBrake(breakingForce / 2, FRONT_LEFT);
            vehicle.setBrake(breakingForce / 2, FRONT_RIGHT);
            vehicle.setBrake(breakingForce, BACK_LEFT);
            vehicle.setBrake(breakingForce, BACK_RIGHT);

            vehicle.setSteeringValue(vehicleSteering, FRONT_LEFT);
            vehicle.setSteeringValue(vehicleSteering, FRONT_RIGHT);


            let tm, p, q, i;

            for (i = 0; i < vehicle.getNumWheels(); i++) {
                vehicle.updateWheelTransform(i, true);
                tm = vehicle.getWheelTransformWS(i);
                p = tm.getOrigin();
                q = tm.getRotation();
                wheelMeshes[i].position.set(p.x(), p.y(), p.z());
                wheelMeshes[i].rotationQuaternion.set(q.x(), q.y(), q.z(), q.w());
                wheelMeshes[i].rotate(BABYLON.Axis.Z, Math.PI / 2);
            }

            tm = vehicle.getChassisWorldTransform();
            p = tm.getOrigin();
            q = tm.getRotation();
            chassisMesh.position.set(p.x(), p.y(), p.z());
            chassisMesh.rotationQuaternion.set(q.x(), q.y(), q.z(), q.w());
            chassisMesh.rotate(BABYLON.Axis.X, Math.PI);
        }
    });

    return chassisMesh;
};

function createVehicle(pos, quat, scene) {
    const wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);
    const wheelAxleCS = new Ammo.btVector3(-1, 0, 0);
    const chassisMesh = createChassisMesh(chassisWidth, chassisHeight, chassisLength);

    const physicsWorld = scene.getPhysicsEngine().getPhysicsPlugin().world;

    const geometry = new Ammo.btBoxShape(new Ammo.btVector3(chassisWidth * .5, chassisHeight * .5, chassisLength * .5));
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(0, 5, 0));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    const motionState = new Ammo.btDefaultMotionState(transform);
    const localInertia = new Ammo.btVector3(0, 0, 0);
    geometry.calculateLocalInertia(massVehicle, localInertia);

    const massOffset = new Ammo.btVector3(0, 0.4, 0);
    const transform2 = new Ammo.btTransform();
    transform2.setIdentity();
    transform2.setOrigin(massOffset);
    const compound = new Ammo.btCompoundShape();
    compound.addChildShape(transform2, geometry);

    const body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(massVehicle, motionState, compound, localInertia));
    body.setActivationState(4);

    function collisionCallbackFunc(cp, colObj0, colObj1) {
        billboardsArray.forEach((item, index) => {
            const isFind = item.billboard.getChildren().find(i => i.physicsImpostor.physicsBody.ptr === colObj1);

            if (!item.isChangeMass && isFind) {
                item.setPositiveMass();
                item.recreate(index);
            }
        });
    }

    const collisionCallbackPointer = Ammo.addFunction(collisionCallbackFunc);
    physicsWorld.setContactProcessedCallback(collisionCallbackPointer);

    physicsWorld.addRigidBody(body);

    const tuning = new Ammo.btVehicleTuning();
    const rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld);
    vehicle = new Ammo.btRaycastVehicle(tuning, body, rayCaster);
    vehicle.setCoordinateSystem(0, 1, 2);
    physicsWorld.addAction(vehicle);

    function addWheel(isFront, pos, radius, width, index) {
        const wheelInfo = vehicle.addWheel(
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

        wheelMeshes[index] = createWheelMesh(radius, width, scene);
    }

    const assetsManager = new BABYLON.AssetsManager(scene);
    const meshTask = assetsManager.addMeshTask("car task", "", "assets/", "car.obj");

    meshTask.onSuccess = function ({loadedMeshes}) {
        const carBody = new BABYLON.Mesh("main", scene);

        loadedMeshes.forEach(i => {
            i.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
            i.rotation.x = Math.PI / 2;
            i.position.y = 3;
            i.position.x = 0.2;
            i.rotation.y = Math.PI;
            i.parent = carBody;
        });

        scene.getMeshByName('wheel_lf_pivot').dispose();

        loadedMeshes[96].dispose();
        loadedMeshes[97].dispose();
        loadedMeshes[99].dispose();
        loadedMeshes[100].dispose();
        loadedMeshes[102].dispose();
        loadedMeshes[103].dispose();
        loadedMeshes[104].dispose();
        loadedMeshes[106].dispose();
        loadedMeshes[107].dispose();

        carBody.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
        carBody.parent = chassisMesh;

        createHeadlights(carBody, scene);

        chassisMesh.isVisible = false;

        addWheel(true, new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_LEFT);
        addWheel(true, new Ammo.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_RIGHT);
        addWheel(false, new Ammo.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_LEFT);
        addWheel(false, new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_RIGHT);

        vehicleReady = true;
    };

    assetsManager.load();

    return chassisMesh;
}

function createChassisMesh(w, l, h, scene) {
    const mesh = new BABYLON.MeshBuilder.CreateBox("box", {width: w, depth: h, height: l}, scene);
    mesh.rotationQuaternion = new BABYLON.Quaternion();
    mesh.material = materials['green'];

    return mesh;
}


function createWheelMesh(radius, width, scene) {
    const faceColors = [];
    faceColors[1] = new BABYLON.Color3(0, 0, 0);

    //set texture for flat face of wheel
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
    mesh.material = materials['tyre2'];

    return mesh;
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

    e.code === 'KeyL' && enableHeadlights();
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'Enter') {
        const icon = iconsFrame.find(icon => icon.isPictureChange);

        icon && icon.openSite();
    }
});


export default createCar;
