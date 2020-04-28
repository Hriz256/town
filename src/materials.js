import * as BABYLON from 'babylonjs';

const materials = {
    scene: null,
    createColor(color, hex) {
        this[color] = new BABYLON.StandardMaterial('color', this.scene);
        this[color].diffuseColor = new BABYLON.Color3.FromHexString(hex);
        this[color].emissiveColor = new BABYLON.Color3.FromHexString(hex);
    },

    createTexture(texture, format = 'jpg') {
        this[texture] = new BABYLON.StandardMaterial(`${texture}`, this.scene);
        this[texture].diffuseTexture = new BABYLON.Texture(`assets/${texture}.${format}`, this.scene);
    },

    createText() {
        const textureResolution = 512;
        const textGround = new BABYLON.DynamicTexture("textSurface", textureResolution, this.scene);
        textGround.hasAlpha = true;

        const matGround = new BABYLON.StandardMaterial("Mat", this.scene);
        matGround.diffuseTexture = textGround;

        return {textGround, matGround};
    }
};

const createBox = ({size, position, rotation, mass, restitution = 0, scene}) => {
    const box = new BABYLON.MeshBuilder.CreateBox("box", {width: size.x, depth: size.z, height: size.y}, scene);
    box.position.set(position.x, position.y, position.z);
    box.rotation.set(rotation.x, rotation.y, rotation.z);

    box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, {
        mass,
        friction: 0.7,
        restitution
    }, scene);

    return box;
};

export {createBox, materials};
