import {createFrame} from "./frameIntersect";
import {drawText, materials, mesh} from "./materials";

const icons = {
    'telegram': {
        position: {
            x: 15,
            y: 5,
            z: -15
        },
        link: 'https://t.me/vladuxxxa',
        description: 'Telegram'
    },
    'github': {
        position: {
            x: 5,
            y: 5,
            z: -15
        },
        link: 'https://github.com/Hriz256',
        description: 'Github'
    },
    'gmail': {
        position: {
            x: -5,
            y: 5,
            z: -15
        },
        link: 'https://mail.google.com/mail/u/0/#inbox?compose=GTvVlcSBmWzBSMPKZTStRvDBvFqkLWXDRZWmMbcWjRdjBZzzrJDDPwwvfVKSVBSbcGFtDskbzqcxC',
        description: 'Gmail: vladik25666@gmail.com'
    },
    'site': {
        position: {
            x: -15,
            y: 5,
            z: -15
        },
        link: 'https://hriz256.github.io/',
        description: 'Портфолио'
    }
};

class Icon {
    constructor({x, y, z, material, scene, link, description}) {
        this.scene = scene;
        this.link = link;
        this.width = 7;
        this.height = 7;
        this.x = x;
        this.y = y;
        this.z = z;
        this.material = material;
        this.diameter = 4;
        this.text = 'открыть';
        this.isPictureChange = false;
        this.description = description;
        this.frameY = 0.05;

        this.createIcon();
        this.createFrame();
        this.createEnter();
        this.createTextAroundFrame();
    }

    createIcon() {
        this.icon = mesh.createSphere({
            diameter: this.diameter,
            position: {x: this.x, y: this.y, z: this.z},
            rotation: {
                x: Math.PI,
                y: Math.PI / 4,
                z: 0
            },
            material: materials.createTexture(`icons/${this.material}`)
        });

        this.icon.setPhysics({mass: 10});
    }

    updateText(isVisible) {
        const font = this.textPlane.getContext().font;

        this.textPlane.getContext().clearRect(0, 0, this.textPlane._cachedSize.width, this.textPlane._cachedSize.height);
        this.textPlane.drawText(isVisible ? this.text : '', 0, null, font, '#fff');
    }

    createFrame() {
        const {frame, text} = createFrame({
            x: this.x,
            y: this.frameY,
            z: this.z + 5,
            width: this.width,
            height: this.height,
            text: this.text,
            scene: this.scene
        });

        this.frame = frame;
        this.textPlane = text;

        this.imgFrame = mesh.createPlane({
            width: this.width,
            height: this.height,
            position: {x: this.x, y: this.frameY, z: this.z + 5},
            rotation: {x: Math.PI / 2, y: Math.PI, z: 0},
            material: materials.createTexture(`icons/${this.material}Floor`, 'png')
        });

        this.imgFrame.scaling.set(0, 0, 1);
    }

    createTextAroundFrame() {
        Array.from(this.description.split(' '), (text, index) => {
            drawText({
                x: this.x + this.width / 2,
                y: this.frameY,
                z: this.z + this.height + (index + 1),
                text,
                multiplier: index === 0 ? 4 : 5,
                size: 60,
                height: 3,
                style: 'bold'
            });
        });
    }

    createEnter() {
        this.enter = mesh.createPlane({
            size: 0.1,
            height: 1.5,
            width: 4,
            position: {
                x: this.x,
                y: 0,
                z: this.z + this.height / 2
            },
            rotation: {
                x: 0,
                y: Math.PI,
                z: 0
            },
            material: materials['icons/enter']
        });

        this.enter.isVisible = false;
    }

    runEnterAnim() {
        const enterAnim = new BABYLON.Animation("enterAnim", "position.y", 120, BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        const scalingX = new BABYLON.Animation("scalingX", "scaling.x", 120, BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        const scalingY = new BABYLON.Animation("scalingZ", "scaling.y", 120, BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        // Here we have chosen a loop mode, but you can change to :
        //  Use previous values and increment it (BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE)
        //  Restart from initial value (BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE)
        //  Keep the final value (BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)

        const enterKeys = [
            {
                frame: 0,
                value: 0
            },
            {
                frame: 80,
                value: this.y + 1
            },
            {
                frame: 100,
                value: this.y
            }
        ];

        const frameKeys = [
            {
                frame: 0,
                value: 0
            },
            {
                frame: 60,
                value: 1
            }
        ];

        enterAnim.setKeys(enterKeys);
        this.enter.animations.push(enterAnim);
        this.scene.beginAnimation(this.enter, 0, 100, false);

        scalingX.setKeys(frameKeys);
        scalingY.setKeys(frameKeys);
        this.imgFrame.animations.push(scalingX, scalingY);
        this.scene.beginAnimation(this.imgFrame, 0, 100, false);
    }

    showEnter() {
        this.isPictureChange = !this.isPictureChange;
        this.enter.isVisible = this.isPictureChange;

        !this.isPictureChange && this.scene.stopAnimation(this.imgFrame);
        this.updateText(!this.isPictureChange);

        if (this.isPictureChange) {
            this.runEnterAnim();
        } else {
            this.enter.position.y = 0;
            this.imgFrame.scaling.set(0, 0, 1);
        }
    }

    openSite() {
        window.open(this.link);
    }
}

const createIcons = (scene) => {
    return Array.from(Object.entries(icons), icon => {
        const {x, y, z} = icon[1].position;

        return new Icon({x, y, z, material: icon[0], link: icon[1].link, scene, description: icon[1].description});
    });
};

export {createIcons};
