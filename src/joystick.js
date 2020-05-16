import * as GUI from 'babylonjs-gui';

const makeThumbArea = (name, thickness, color, background) => {
    let circle = new GUI.Ellipse();
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
    const adt = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
    const sideJoystickOffset = 150;
    const bottomJoystickOffset = -50;
    let xAddPos = 0;
    let yAddPos = 0;

    const leftThumbContainer = makeThumbArea('leftThumb', 2, 'blue', null);
    leftThumbContainer.height = '200px';
    leftThumbContainer.width = '200px';
    leftThumbContainer.isPointerBlocker = true;
    leftThumbContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    leftThumbContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    leftThumbContainer.alpha = 0.4;
    leftThumbContainer.left = sideJoystickOffset;
    leftThumbContainer.top = bottomJoystickOffset;

    const leftInnerThumbContainer = makeThumbArea('leftInnterThumb', 4, 'blue', null);
    leftInnerThumbContainer.height = '80px';
    leftInnerThumbContainer.width = '80px';
    leftInnerThumbContainer.isPointerBlocker = true;
    leftInnerThumbContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    leftInnerThumbContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;


    const leftPuck = makeThumbArea('leftPuck', 0, 'blue', 'blue');
    leftPuck.height = '60px';
    leftPuck.width = '60px';
    leftPuck.isPointerBlocker = true;
    leftPuck.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    leftPuck.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;


    leftThumbContainer.onPointerDownObservable.add(coordinates => {
        leftPuck.isVisible = true;
        leftPuck.floatLeft = coordinates.x - (leftThumbContainer._currentMeasure.width * .5) - sideJoystickOffset;
        leftPuck.left = leftPuck.floatLeft;
        leftPuck.floatTop = adt._canvas.height - coordinates.y - (leftThumbContainer._currentMeasure.height * .5) + bottomJoystickOffset;
        leftPuck.top = leftPuck.floatTop * -1;
        leftPuck.isDown = true;
        leftThumbContainer.alpha = 0.9;
    });

    leftThumbContainer.onPointerUpObservable.add(() => {
        xAddPos = 0;
        yAddPos = 0;
        leftPuck.isDown = false;
        leftPuck.isVisible = false;
        leftThumbContainer.alpha = 0.4;
    });


    leftThumbContainer.onPointerMoveObservable.add(coordinates => {
        if (leftPuck.isDown) {
            xAddPos = coordinates.x - (leftThumbContainer._currentMeasure.width * .5) - sideJoystickOffset;
            yAddPos = adt._canvas.height - coordinates.y - (leftThumbContainer._currentMeasure.height * .5) + bottomJoystickOffset;
            leftPuck.floatLeft = xAddPos;
            leftPuck.floatTop = yAddPos * -1;
            leftPuck.left = leftPuck.floatLeft;
            leftPuck.top = leftPuck.floatTop;
        }
    });

    adt.addControl(leftThumbContainer);
    leftThumbContainer.addControl(leftInnerThumbContainer);
    leftThumbContainer.addControl(leftPuck);
    leftPuck.isVisible = false;

    return {
        getX() {
            return xAddPos;
        },

        getY() {
            return yAddPos;
        }
    }
};

export {createJoystick};
