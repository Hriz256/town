import * as BABYLON from "babylonjs";
import {materials, createBox} from "./materials";
import './meshwriter.min';

let billboardsArray;
const billboardsInfo = [
    {
        x: -10,
        z: 15,
        size: 1,
        url: 'assets/billboard/firelink.png',
        text: {
            title: 'FireLink (слоты) 2d',
            description: 'Написана на Phaser3.'
        }
    },
    {
        x: -25,
        z: 15,
        size: 1,
        url: 'assets/billboard/firelink2.png',
    },
    {
        x: -50,
        z: 15,
        size: 1,
        url: 'assets/billboard/roulette.png',
        text: {
            title: 'Рулетка 2d',
            description: 'Написана на Phaser3. Большая сложность разработки\nзаключалась в реализации реалистичного падения шарика\nна колесо. В итоге было сделано 2 отличных друг от друга\nвида падений'
        }
    },
    {
        x: -65,
        z: 15,
        size: 1,
        url: 'assets/billboard/roulette2.png',
    },
    // {
    //     x: -40,
    //     z: 15,
    //     size: 1,
    //     url: 'assets/billboard/race.png'
    // },
    // {
    //     x: -55,
    //     z: 15,
    //     size: 1,
    //     url: 'assets/billboard/lotto.png'
    // }
];


const createGround = (scene) => {
    const ground = BABYLON.Mesh.CreateGround("ground", 200, 200, 2, scene);
    materials['grass'].diffuseTexture.uScale = 200.0;
    materials['grass'].diffuseTexture.vScale = 200.0;

    ground.material = materials['grass'];
    ground.material.specularColor = new BABYLON.Color3(.1, .1, .1);
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: 0,
        friction: 0.7,
        restitution: 0.7
    }, scene);

    ground.position.y = 3.5;
};

const createPhysicsText = ({text, pos, thickness = 15, scene}) => {
    const scale = 0.1;

    const Type = TYPE(scene, scale);
    const physicsText = new Type(
        `${text}`,
        {
            "anchor": "center",
            "letter-height": 50,
            "letter-thickness": thickness,
            "color": "#1C5030",
            "position": {
                "x": 0,
                "y": 0,
                "z": 0
            }
        }
    );

    const mesh = physicsText.getMesh();

    const vectorsWorld = mesh.getBoundingInfo().boundingBox.vectorsWorld;
    const x = +(vectorsWorld[1].x - vectorsWorld[0].x);
    const y = +(vectorsWorld[1].y - vectorsWorld[0].y);
    const z = +(vectorsWorld[1].z - vectorsWorld[0].z);

    const container = createBox({
        size: new BABYLON.Vector3(x, y, z),
        position: new BABYLON.Vector3(pos.x - x / 2, pos.y, pos.z),
        rotation: new BABYLON.Vector3(-Math.PI / 2, -Math.PI, 0),
        mass: 2,
        restitution: 0,
        scene
    });

    container.isVisible = false;
    mesh.parent = container;
    mesh.position.y += y / 2;
    mesh.position.z -= z / 2;

    return x;
};

class Billboard {
    constructor({scene, url, x, z, size, text}) {
        this.scene = scene;
        this.timeout = 0;
        this.x = x;
        this.z = z;
        this.size = size;
        this.imgUrl = url;
        this.heightQuantity = 7;
        this.widthQuantity = 12;
        this.isChangeMass = true; // Разрешаем менять массу на положительную, чтобы кубики имели физику
        this.currentIndex = 0;

        this.billboard = new BABYLON.Mesh("billboard", this.scene);
        this.billboard.position = new BABYLON.Vector3(this.x, 3.5, this.z);
        // this.billboard.rotate(BABYLON.Axis.Y, -Math.PI / 10, BABYLON.Space.LOCAL);


        this.createPicture(false);
    }

    getMaterial(xOffset, yOffset) {
        const mat = new BABYLON.StandardMaterial("mat", this.scene);
        mat.diffuseTexture = new BABYLON.Texture(this.imgUrl, this.scene);
        mat.diffuseTexture.uScale = 0.1;
        mat.diffuseTexture.vScale = 0.2;
        mat.diffuseTexture.uOffset = xOffset;
        mat.diffuseTexture.vOffset = yOffset;

        return mat;
    }

    createCube({x, y, posX, posY, sizeHeight, sizeWidth, isRecreate, isEven}) {
        // Проверка через find нужна, потому что getChildren() даёт неправильный порядок
        isRecreate && this.billboard.getChildren().find(item => item.currentIndex === this.currentIndex).dispose();

        const pos = isEven ? posX - (sizeWidth / 2) : posX + (sizeWidth / 2);

        const box = createBox({
            size: new BABYLON.Vector3(this.size, sizeWidth, sizeHeight),
            position: new BABYLON.Vector3(pos, posY + sizeHeight / 2, 0),
            rotation: new BABYLON.Vector3(-Math.PI / 2, Math.PI / 2, 0),
            mass: 0,
            restitution: 0,
            scene: this.scene
        });

        box.parent = this.billboard;
        box.currentIndex = this.currentIndex; // Запоминаем индекс каждого куба, что в дальнейшем проверять через него
        box.material = (x === 0 || x === this.widthQuantity - 1 || y === 0 || y === this.heightQuantity - 1) ?
            materials['green'] :
            this.getMaterial((x - 1) / 10, (y - 1) / 5);
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

    setPositiveMass() {
        this.isChangeMass = true;
        this.billboard.getChildren().forEach(i => i.physicsImpostor.setMass(0.3));
    }

    recreate() {
        this.timeout = 50;
        this.currentIndex = 0;

        setTimeout(() => this.createPicture(true), 2000);
    }
}

const drawText = ({x, y, z, scene, text}) => {
    const {textGround, matGround} = materials.createText();
    const planeSize = 25;
    const plane = BABYLON.Mesh.CreatePlane("outputplane", planeSize, scene, false);
    plane.position = new BABYLON.Vector3(x - planeSize / 2, y, z + planeSize / 2);
    plane.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI, 0);
    plane.material = matGround;

    const descriptionLines = text.description.split('\n');

    const titleSize = 32;
    const descriptionSize = 18;

    textGround.drawText(text.title, 0, titleSize, `bold ${titleSize}px Arial`, 'white', null, true, true);

    descriptionLines.forEach((i, index) => {
        textGround.drawText(
            i,
            0,
            titleSize * 2.5 + descriptionSize * index,
            `${descriptionSize}px Arial`,
            'white',
            null,
            true,
            true
        );
    })
};

const create = (scene) => {
    createGround(scene);
    billboardsArray = billboardsInfo.map(item => {
        const {x, z, size, url, text} = item;

        text && drawText({x, z: z + 5, y: 3.6, scene, text});

        return new Billboard({
            scene,
            x,
            z,
            size,
            url
        });
    });

    const letters = 'vladislav zhidko'.split('').filter(i => i !== ' ');
    let x = 0;

    letters.forEach(i => {
        const letterWidth = createPhysicsText({
            text: i,
            pos: new BABYLON.Vector3(21 + x, 5.5, -10),
            scene
        });

        x -= letterWidth + 1;
    });
};

export default create;
export {billboardsArray};
