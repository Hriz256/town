import * as BABYLON from "babylonjs";
import {materials, drawText, mesh} from "../materials";
import {createFrame} from "../frameIntersect";

class Billboard {
    constructor({scene, url, x, z, size, width, height, videoURL}) {
        this.scene = scene;
        this.timeout = 0;
        this.x = x;
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

        this.widthWithoutBorder = width - 2;
        this.heightWithoutBorder = height - 2;

        this.billboard = new BABYLON.Mesh("billboard", this.scene);
        this.billboard.position = new BABYLON.Vector3(this.x, 0, this.z);
        // this.billboard.rotate(BABYLON.Axis.Y, -Math.PI / 10, BABYLON.Space.LOCAL);


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
        const mat = new BABYLON.StandardMaterial("mat", this.scene);

        mat.diffuseTexture = new BABYLON.Texture(this.imgURL, this.scene);
        mat.diffuseTexture.uScale = 1 / this.widthWithoutBorder;
        mat.diffuseTexture.vScale = 1 / this.heightWithoutBorder;
        mat.diffuseTexture.uOffset = xOffset;
        mat.diffuseTexture.vOffset = yOffset;
        mat.maxSimultaneousLights = 16;

        return mat;
    }

    createCube({x, y, posX, posY, sizeHeight, sizeWidth, isRecreate, isEven}) {
        // Проверка через find нужна, потому что getChildren() даёт неправильный порядок
        isRecreate && this.getCubes().find(item => item.currentIndex === this.currentIndex).dispose();

        const pos = isEven ? posX - (sizeWidth / 2) : posX + (sizeWidth / 2);

        const box = mesh.createBox({
            size: new BABYLON.Vector3(this.size, sizeWidth, sizeHeight),
            position: new BABYLON.Vector3(pos, posY + sizeHeight / 2, 0),
            rotation: new BABYLON.Vector3(-Math.PI / 2, Math.PI / 2, 0),
            material: (x === 0 || x === this.widthQuantity - 1 || y === 0 || y === this.heightQuantity - 1) ?
                materials['green'] :
                this.getMaterial((x - 1) / this.widthWithoutBorder, (y - 1) / this.heightWithoutBorder)
        });

        box.setPhysics({mass: 0});
        box.parent = this.billboard;
        box.currentIndex = this.currentIndex; // Запоминаем индекс каждого куба, чтобы в дальнейшем проверять через него
    }

    async createPicture(isRecreate) {
        let posX = 0;
        let posY = 0; // на этом уровне находится земля

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

                posX = isEven ? posX - sizeWidth : posX + sizeWidth;
                this.currentIndex++;
            }

            posY += sizeHeight;
        }

        if (this.billboard.getChildren().length === this.heightQuantity * this.widthQuantity) { // Если создали все кубы, меняем значение
            this.isChangeMass = false;
        }

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
        this.getCubes().filter(i => i.material.name !== 'green').forEach(i => i.isVisible = false);
        this.video.material.diffuseTexture.video.play();
    }

    hideVideo() {
        this.updateText('#fff');
        this.frame.material = materials['white'];
        this.isVideoShow = false;
        this.video.isVisible = false;
        this.getCubes().forEach(i => i.isVisible = true);
        this.video.material.diffuseTexture.video.pause();
    }

    setPositiveMass() {
        this.isChangeMass = true;
        this.getCubes().forEach(i => i.physicsImpostor.setMass(0.3));
    }

    getCubes() {
        return this.billboard.getChildren();
    }

    recreate() {
        this.timeout = 50;
        this.currentIndex = 0;

        setTimeout(() => this.createPicture(true), 2000);
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

    let currentLine = '';

    Array.from(Array.from(text.description), (letter, index) => {
        if (index % step === 0) {
            currentLine = '';
        }

        currentLine += letter;
        descriptionLines[Math.floor(index / step)] = currentLine;
    });

    draw({text: text.title, index: 0, multiplier: titleMultiplier});
    Array.from(descriptionLines, (text, index) => draw({text, index, multiplier: descriptionMultiplier}));
};

export {Billboard, createBillboardText}
