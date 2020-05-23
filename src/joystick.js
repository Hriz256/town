import * as GUI from 'babylonjs-gui';

const makeThumbArea = (name, thickness, color, background) => {
    const circle = new GUI.Ellipse();
    circle.name = name;
    circle.thickness = thickness;
    circle.color = color;
    circle.background = background;
    circle.paddingLeft = '0px';
    circle.paddingRight = '0px';
    circle.paddingTop = '0px';
    circle.paddingBottom = '0px';

    return circle;
};

const createJoystick = () => {
    const adt = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
    const canvas = document.getElementById('renderCanvas');
    const sideJoystickOffset = -150;
    const bottomJoystickOffset = -50;

    const bigR = 100;
    const smallR = 30;

    const leftThumbContainer = makeThumbArea('leftThumb', 2, 'blue', null);
    leftThumbContainer.height = `${bigR * 2}px`;
    leftThumbContainer.width = `${bigR * 2}px`;
    leftThumbContainer.isPointerBlocker = true;
    leftThumbContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    leftThumbContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    leftThumbContainer.alpha = 0.4;
    leftThumbContainer.left = sideJoystickOffset;
    leftThumbContainer.top = bottomJoystickOffset;

    const leftPuck = makeThumbArea('leftPuck', 0, 'blue', 'blue');
    leftPuck.height = `${smallR * 2}px`;
    leftPuck.width = `${smallR * 2}px`;
    leftPuck.isPointerBlocker = true;
    leftPuck.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    leftPuck.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    leftPuck.isDown = false;

    document.addEventListener('pointermove', e => {
        if (leftPuck.isDown) {
            const xAddPos = (canvas.width - -sideJoystickOffset - bigR) - e.offsetX;
            const yAddPos = (canvas.height - -bottomJoystickOffset - bigR) - e.offsetY;
            const angle = Math.atan2(yAddPos, xAddPos);
            const distance = Math.min(bigR - smallR, Math.hypot(yAddPos, xAddPos));

            leftPuck.left = -Math.cos(angle) * distance;
            leftPuck.top = -Math.sin(angle) * distance;
        }
    });

    document.addEventListener('pointerup', () => {
        leftPuck.isDown = false;
        leftPuck.left = 0;
        leftPuck.top = 0;
        leftThumbContainer.alpha = 0.4;
    });

    document.addEventListener('pointerdown', e => {
        const xAddPos = (canvas.width - -sideJoystickOffset - bigR) - e.offsetX;
        const yAddPos = (canvas.height - -bottomJoystickOffset - bigR) - e.offsetY;
        const distanceToPoint = Math.hypot(yAddPos, xAddPos);

        if (distanceToPoint <= bigR) {
            leftPuck.isDown = true;
            leftThumbContainer.alpha = 0.9;
        }
    });

    adt.addControl(leftThumbContainer);
    leftThumbContainer.addControl(leftPuck);

    return {
        getX() {
            return parseInt(leftPuck.left);
        },

        getY() {
            return parseInt(leftPuck.top);
        },

        getMaxDistance() {
            return bigR - smallR;
        }
    }
};

export {createJoystick};
