import {billboardsArray, iconsFrame} from "./playground/playground";
import {createJoystick} from "./joystick";
import {createVehicle, car} from "./car";
import {materials, mesh} from "./playground/materials";
import {createPlayground} from "./playground/playground";

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

const update = (scene) => {
    scene.onPointerDown = (evt, pickResult) => {
        const icon = iconsFrame.find(icon => icon.isPictureChange);

        if (icon && icon.frame.intersectsPoint(new BABYLON.Vector3(pickResult.pickedPoint.x, icon.frame.position.y, pickResult.pickedPoint.z))) {
            icon.openSite();
        }
    };

    scene.registerBeforeRender(() => {
        billboardsArray.filter(i => i.frame).forEach(item => {
            if (car.chassisMesh.intersectsMesh(item.frame, false) && !item.isVideoShow &&
                (car.chassisMesh.position.x !== 0 && car.chassisMesh.position.z !== 0)) {
                item.showVideo();
            }

            if (!car.chassisMesh.intersectsMesh(item.frame, false) && item.isVideoShow) {
                item.hideVideo();
            }
        });

        Array.from(billboardsArray, item => {
            if (car.chassisMesh.intersectsMesh(item.physicsZone, false) && !item.isChangeMass &&
                (car.chassisMesh.position.x !== 0 && car.chassisMesh.position.z !== 0)) {
                item.setPositiveMass();
                item.recreate();
            }
        });

        Array.from(iconsFrame, icon => {
            if (car.chassisMesh.intersectsMesh(icon.frame, false) && !icon.isPictureChange &&
                (car.chassisMesh.position.x !== 0 && car.chassisMesh.position.z !== 0)) {
                icon.showEnter();
            }

            if (!car.chassisMesh.intersectsMesh(icon.frame, false) && icon.isPictureChange &&
                (car.chassisMesh.position.x !== 0 && car.chassisMesh.position.z !== 0)) {
                icon.showEnter();
            }
        });


        // if (car.vehicleReady) {
        let speed = car.vehicle.getCurrentSpeedKmHour();
        car.breakingForce = 0;
        car.engineForce = 0;

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

        car.vehicle.applyEngineForce(car.engineForce, car.front_left);
        car.vehicle.applyEngineForce(car.engineForce, car.front_right);

        car.vehicle.setBrake(car.breakingForce / 2, car.front_left);
        car.vehicle.setBrake(car.breakingForce / 2, car.front_right);
        car.vehicle.setBrake(car.breakingForce, car.back_left);
        car.vehicle.setBrake(car.breakingForce, car.back_right);

        car.vehicle.setSteeringValue(car.vehicleSteering, car.front_left);
        car.vehicle.setSteeringValue(car.vehicleSteering, car.front_right);


        let tm, p, q, i;

        for (i = 0; i < car.vehicle.getNumWheels(); i++) {
            car.vehicle.updateWheelTransform(i, true);
            tm = car.vehicle.getWheelTransformWS(i);
            p = tm.getOrigin();
            q = tm.getRotation();
            car.wheelMeshes[i].position.set(p.x(), p.y(), p.z());
            car.wheelMeshes[i].rotationQuaternion.set(q.x(), q.y(), q.z(), q.w());
            car.wheelMeshes[i].rotate(BABYLON.Axis.Z, Math.PI / 2);
        }

        tm = car.vehicle.getChassisWorldTransform();
        p = tm.getOrigin();
        q = tm.getRotation();
        car.chassisMesh.position.set(p.x(), p.y(), p.z());
        car.chassisMesh.rotationQuaternion.set(q.x(), q.y(), q.z(), q.w());
        car.chassisMesh.rotate(BABYLON.Axis.X, Math.PI);
    });
};

const main = ({scene, camera}) => {
    mesh.scene = scene;

    materials.scene = scene;
    materials.createColor('green', '#1C5030');
    materials.createColor('lightColor', '#feff7f');
    materials.createColor('white', '#ffffff');
    materials.createTexture('icons/enter', 'png');
    materials['icons/enter'].diffuseTexture.hasAlpha = true;

    const joystick = createJoystick(); //
    createPlayground(scene); // Создаём площадку со всеми объектами
    camera.lockedTarget = createVehicle(scene); // Создаём машинку

    update(scene);
};

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

window.addEventListener('keyup', (e) => {
    if (e.code === 'Enter') {
        const icon = iconsFrame.find(icon => icon.isPictureChange);

        icon && icon.openSite();
    }
});

export {main};