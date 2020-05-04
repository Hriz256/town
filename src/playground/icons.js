import {createFrame} from "./frameIntersect";
import {drawText, materials, mesh} from "./materials";

const icons = {
    'telegram': {
        position: {
            x: 20,
            y: 5,
            z: 5
        },
        link: 'https://t.me/vladuxxxa',
        description: 'Telegram'
    },
    'github': {
        position: {
            x: 10,
            y: 5,
            z: 5
        },
        link: 'https://github.com/Hriz256',
        description: 'Github'
    },
    'gmail': {
        position: {
            x: 0,
            y: 5,
            z: 5
        },
        link: 'https://mail.google.com/mail/u/0/#inbox?compose=GTvVlcSBmWzBSMPKZTStRvDBvFqkLWXDRZWmMbcWjRdjBZzzrJDDPwwvfVKSVBSbcGFtDskbzqcxC',
        description: 'Gmail: vladik25666@gmail.com'
    },
    'site': {
        position: {
            x: -10,
            y: 5,
            z: 5
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
        this.frameText = 'открыть';
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

    createFrame() {
        const {frame, text} = createFrame({
            x: this.x,
            y: this.frameY,
            z: this.z + 5,
            width: this.width,
            height: this.height,

            text: this.frameText,
            scene: this.scene
        });

        this.frame = frame;
        this.text = text;
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
        const animationBox = new BABYLON.Animation("tutoAnimation", "position.y", 120, BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        //Here we have chosen a loop mode, but you can change to :
        //  Use previous values and increment it (BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE)
        //  Restart from initial value (BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE)
        //  Keep the final value (BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)

        // Animation keys
        const keys = [];

        keys.push({
            frame: 0,
            value: 0
        });

        keys.push({
            frame: 80,
            value: this.y + 1
        });

        keys.push({
            frame: 100,
            value: this.y
        });

        animationBox.setKeys(keys);
        this.enter.animations.push(animationBox);
        this.scene.beginAnimation(this.enter, 0, 100, false);
    }

    showEnter() {
        this.isPictureChange = !this.isPictureChange;
        this.enter.isVisible = this.isPictureChange;

        this.enter.isVisible ? this.runEnterAnim() : this.enter.position.y = 0;
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
