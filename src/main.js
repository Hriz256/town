import {billboardsArray, iconsFrame} from "./playground/playground";
import {createJoystick} from "./joystick";
import {createVehicle, car} from "./car";
import {materials, mesh} from "./playground/materials";
import {createPlayground} from "./playground/playground";

const isMobile = false;

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


    if (car.vehicleReady) {
        scene.registerBeforeRender(() => {
            billboardsArray.filter(i => i.frame).forEach(item => {
                if (car.chassisMesh.intersectsMesh(item.frame, false) && !item.isVideoShow &&
                    (car.chassisMesh.position.x && car.chassisMesh.position.z)) {
                    item.showVideo();
                }

                if (!car.chassisMesh.intersectsMesh(item.frame, false) && item.isVideoShow) {
                    item.hideVideo();
                }
            });

            Array.from(billboardsArray, item => {
                if (car.chassisMesh.intersectsMesh(item.physicsZone, false) && !item.isChangeMass &&
                    (car.chassisMesh.position.x && car.chassisMesh.position.z)) {
                    item.setPositiveMass();
                    item.recreate();
                }
            });

            Array.from(iconsFrame, icon => {
                if (car.chassisMesh.intersectsMesh(icon.frame, false) && !icon.isPictureChange &&
                    (car.chassisMesh.position.x && car.chassisMesh.position.z)) {
                    icon.showEnter();
                }

                if (!car.chassisMesh.intersectsMesh(icon.frame, false) && icon.isPictureChange &&
                    (car.chassisMesh.position.x && car.chassisMesh.position.z)) {
                    icon.showEnter();
                }
            });

            const speed = car.vehicle.getCurrentSpeedKmHour();
            car.breakingForce = 0;
            car.engineForce = 0;

            isMobile ? mobileControl(joystick, speed) : pcControl(speed);

            car.vehicle.applyEngineForce(car.engineForce, car.front_left);
            car.vehicle.applyEngineForce(car.engineForce, car.back_left);

            car.vehicle.setBrake(car.breakingForce / 2, car.front_left);
            car.vehicle.setBrake(car.breakingForce / 2, car.front_right);
            car.vehicle.setBrake(car.breakingForce, car.back_left);
            car.vehicle.setBrake(car.breakingForce, car.back_right);

            car.vehicle.setSteeringValue(car.vehicleSteering, car.front_left);
            car.vehicle.setSteeringValue(car.vehicleSteering, car.back_left);


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
    }
};

const load = scene => {
    const assetsManager = new BABYLON.AssetsManager(scene);
    assetsManager.addMeshTask("car task", "", "assets/", "car.gltf");

    assetsManager.load();

    return new Promise(resolve => {
        assetsManager.onFinish = tasks => resolve(tasks);
    });
};

const main = async ({scene, camera}) => {
    const tasks = await load(scene);

    mesh.scene = scene;

    materials.scene = scene;
    materials.createColor('green', '#1C5030');
    materials.createColor('white', '#ffffff');
    materials.createColor('lightColor', '#feff7f');
    materials.createTexture('icons/enter', 'png');
    materials['icons/enter'].diffuseTexture.hasAlpha = true;

    const joystick = createJoystick();
    createPlayground(scene); // Создаём площадку со всеми объектами
    camera.lockedTarget = createVehicle(scene, {carTask: tasks[0]}); // Создаём машинку

    update(scene, joystick);
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
