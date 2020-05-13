import {materials, drawText, mesh} from "../materials";
import {createFrame} from "../frameIntersect";

class Billboard {
    constructor({scene, url, x, z, size, width, height, videoURL}) {
        this.scene = scene;
        this.timeout = 0;
        this.x = x;
        this.y = 0;
        this.z = z;
        this.size = size;
        this.imgURL = url;
        this.heightQuantity = height;
        this.widthQuantity = width;
        this.isChangeMass = true; // Разрешаем менять массу на положительную, чтобы кубики имели физику
        this.currentIndex = 0;
        this.videoURL = videoURL;
        this.isVideoShow = false;
        this.videoFrameText = 'зона просмотра видео';
        this.cubes = {};

        this.widthWithoutBorder = width - 2;
        this.heightWithoutBorder = height - 2;

        this.createPhysicsZone();
        this.createPicture(false);
        videoURL && this.createVideoFrame();
    }

    createVideoFrame() {
        const frameHeight = this.heightQuantity;
        const frameWidth = this.widthQuantity - (1 - 0.25) * 2; // 0.25 - размер рамковых блоков

        const {frame, text} = createFrame({
            x: this.x - frameWidth / 2,
            z: this.z + frameHeight * 1.2,
            y: 0.05,
            width: frameWidth,
            height: frameHeight,
            text: this.videoFrameText,
            scene: this.scene
        });

        this.frame = frame;
        this.text = text;

        this.createVideo();
    }

    getMaterial(xOffset, yOffset) {
        const mat = materials.createTexture(this.imgURL.slice(0, -4), this.imgURL.slice(-3));
        mat.diffuseTexture.uScale = 1 / this.widthWithoutBorder;
        mat.diffuseTexture.vScale = 1 / this.heightWithoutBorder;
        mat.diffuseTexture.uOffset = xOffset;
        mat.diffuseTexture.vOffset = yOffset;
        // mat.maxSimultaneousLights = 16;

        return mat;
    }

    createPhysicsZone() {
        const width = this.widthWithoutBorder * this.size + 2 * this.size / 4;
        const height = this.heightWithoutBorder * this.size + 2 * this.size / 4;

        this.physicsZone = mesh.createBox({
            size: {
                x: width + 1,
                y: height,
                z: this.size * 2
            },
            position: {
                x: this.x - width / 2,
                y: height / 2,
                z: this.z
            },
            material: materials['lightColor']
        });

        this.physicsZone.isVisible = false;
    }

    createCube({x, y, posX, posY, sizeHeight, sizeWidth, isRecreate, isEven}) {
        if (isRecreate) {
            this.cubes[this.currentIndex].dispose();
            this.cubes[this.currentIndex] = null;
        }

        const pos = isEven ? posX - (sizeWidth / 2) : posX + (sizeWidth / 2);

        this.cubes[this.currentIndex] = mesh.createBox({
            size: new BABYLON.Vector3(this.size, sizeWidth, sizeHeight),
            position: new BABYLON.Vector3(pos, posY + sizeHeight / 2, this.z),
            rotation: new BABYLON.Vector3(-Math.PI / 2, Math.PI / 2, 0),
            material: (!x || x === this.widthQuantity - 1 || !y || y === this.heightQuantity - 1) ?
                materials['green'] :
                this.getMaterial((x - 1) / this.widthWithoutBorder, (y - 1) / this.heightWithoutBorder)
        });

        this.cubes[this.currentIndex].material.alpha = 0.6;
    }

    async createPicture(isRecreate) {
        let posX = this.x;
        let posY = this.y; // на этом уровне находится земля

        for (let y = 0; y < this.heightQuantity; y++) {
            const sizeHeight = y === 0 || y === this.heightQuantity - 1 ? this.size / 4 : this.size;
            const isEven = y % 2 === 0;

            for (let x = isEven ? 0 : this.widthQuantity - 1; isEven ? x < this.widthQuantity : x >= 0; isEven ? x++ : x--) {
                const sizeWidth = x === 0 || x === this.widthQuantity - 1 ? this.size / 4 : this.size;

                await new Promise(resolve => {
                    setTimeout(() => {
                        this.createCube({x, y, posX, posY, sizeHeight, sizeWidth, isRecreate, isEven});
                        resolve();
                    }, this.timeout);
                });

                this.currentIndex++;
                posX = isEven ? posX - sizeWidth : posX + sizeWidth;
            }

            posY += sizeHeight;
        }

        if (this.currentIndex === this.heightQuantity * this.widthQuantity) { // Если создали все кубы, меняем значение
            this.isChangeMass = false;
            this.setAlpha();
        }
    }

    setAlpha() {
        Array.from(Object.values(this.cubes), item => item.material.alpha = 1);
    }

    createVideo() {
        const {mat} = materials.createVideo({videoURL: this.videoURL, imgURL: this.imgURL});

        this.video = mesh.createPlane({
            size: 0.1,
            height: this.heightQuantity - 2,
            width: this.widthQuantity - 2,
            position: {
                x: this.x - this.widthQuantity / 2 + 0.75,
                y: this.heightQuantity / 2 - 0.75,
                z: this.z + this.size / 2
            },
            rotation: {
                x: 0,
                y: Math.PI,
                z: 0
            },
            material: mat
        });

        this.video.isVisible = false;
    }

    updateText(color) {
        const font = this.text.getContext().font;

        this.text.getContext().clearRect(0, 0, this.text._cachedSize.width, this.text._cachedSize.height);
        this.text.drawText(this.videoFrameText, 0, null, font, color);
    }

    showVideo() {
        this.updateText('#1C5030');
        this.frame.material = materials['green'];
        this.isVideoShow = true;
        this.video.isVisible = true;
        Object.values(this.cubes).filter(i => i.material.name !== 'green').forEach(i => i.isVisible = false);
        this.video.material.diffuseTexture.video.play();
    }

    hideVideo() {
        this.updateText('#fff');
        this.frame.material = materials['white'];
        this.isVideoShow = false;
        this.video.isVisible = false;
        Array.from(Object.values(this.cubes), item => item.isVisible = true);
        this.video.material.diffuseTexture.video.pause();
    }

    setPositiveMass() {
        this.isChangeMass = true;
        Array.from(Object.values(this.cubes), item => item.setPhysics({mass: 0.3}));
    }

    recreate() {
        this.timeout = 50;
        this.currentIndex = 0;

        setTimeout(() => this.createPicture(true), 5000);
    }
}

const createBillboardText = ({x, z, y, text}) => {
    const titleMultiplier = 2; // Множитель размера шрифта
    const descriptionMultiplier = 3; // Множитель размера шрифта
    const height = 3;

    const draw = ({text, index, multiplier}) => {
        drawText({
            x: x + 2.75,
            y,
            z: multiplier === descriptionMultiplier ? z + index * (height / 2) + (height * 2) : z + height,
            text,
            multiplier,
            size: 60,
            height,
            style: multiplier === titleMultiplier ? 'bold' : 'normal'
        })
    };

    const descriptionLines = [];
    const step = Math.floor(text.description.length / 5); // 5 - число желаемых строк

    Array.from(Array.from(text.description), (letter, index) => {
        if (!descriptionLines[Math.floor(index / step)]) {
            descriptionLines[Math.floor(index / step)] = ''
        }

        descriptionLines[Math.floor(index / step)] += letter;
    });

    draw({text: text.title, index: 0, multiplier: titleMultiplier});
    Array.from(descriptionLines, (text, index) => draw({text, index, multiplier: descriptionMultiplier}));
};

export {Billboard, createBillboardText}
