const colors = {
    'peach': '#ffe5b4',
    'green': '#1C5030',
    'white': '#ffffff',
    'lightColor': '#feff7f',
    'lightGreen': '#A5C148'
};

const materials = {
    scene: null,
    baseUrl: 'assets/',

    createColor(color, hex) {
        this[color] = new BABYLON.StandardMaterial(`${color}`, this.scene);
        this[color].diffuseColor = new BABYLON.Color3.FromHexString(hex);
        // this[color].emissiveColor = new BABYLON.Color3.FromHexString(hex);

        return this[color];
    },

    createTexture(texture, format = 'jpg') {
        this[texture] = new BABYLON.StandardMaterial(`${texture}`, this.scene);
        this[texture].diffuseTexture = new BABYLON.Texture(`${this.baseUrl}${texture}.${format}`, this.scene);

        return this[texture];
    },

    createText({width, height, text = ''}) {
        const textGround = new BABYLON.DynamicTexture(text, {width, height}, this.scene);
        textGround.hasAlpha = true;
        // textGround.maxSimultaneousLights = 16;

        const matGround = new BABYLON.StandardMaterial(text, this.scene);
        matGround.diffuseTexture = textGround;
        // matGround.maxSimultaneousLights = 16;

        return {textGround, matGround};
    },

    createVideo({videoURL, imgURL}) {
        const mat = new BABYLON.StandardMaterial(videoURL, this.scene);
        const videoTexture = new BABYLON.VideoTexture(videoURL, [`${this.baseUrl}${videoURL}`], this.scene, true, false, BABYLON.VideoTexture.TRILINEAR_SAMPLINGMODE, {
            poster: `${this.baseUrl}${imgURL}`,
            autoUpdateTexture: true
        });
        mat.diffuseTexture = videoTexture;

        return {mat, videoTexture};
    },

    setColors() {
        Array.from(Object.entries(colors), color => this.createColor(color[0], color[1]));
    }
};

const mesh = {
    scene: null,

    createPlane({width, height, ...generalParams}) {
        const plane = BABYLON.MeshBuilder.CreatePlane('plane', {width, height}, this.scene);
        this._generalParams(plane, generalParams);

        return plane;
    },

    createSphere({diameter, ...generalParams}) {
        const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {diameter}, this.scene);
        this._generalParams(sphere, generalParams);

        return sphere;
    },

    createBox({size, ...generalParams}) {
        const box = new BABYLON.MeshBuilder.CreateBox("box", {
            width: size.x,
            depth: size.z,
            height: size.y
        }, this.scene);
        this._generalParams(box, generalParams);

        return box;
    },

    createGround({width, height, subdivisions = 25, ...generalParams}) {
        const ground = BABYLON.MeshBuilder.CreateGround('ground', {width, height, subdivisions}, this.scene);
        this._generalParams(ground, generalParams);

        return ground;
    },

    setPhysics({impostor = 'BoxImpostor', mass = 0, restitution = 0, friction = 0.7}) {
        this.physicsImpostor = new BABYLON.PhysicsImpostor(this, BABYLON.PhysicsImpostor[impostor], {
            mass,
            friction,
            restitution,
        }, this.scene);
    },

    _generalParams(mesh, {position, rotation = new BABYLON.Vector3(0, 0, 0), material}) {
        mesh.position.set(position.x, position.y, position.z);
        mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        mesh.material = material;
        mesh.setPhysics = this.setPhysics;
    },
};

const drawText = ({x, y, z, text, size, multiplier = 3, height, inCenterX = false, inCenterZ = false, style = 'normal'}) => {
    const DTHeight = multiplier * size;
    const ratio = height / DTHeight;
    const initText = materials.createText({width: 64, height: 64});
    const tmpctx = initText.textGround.getContext();
    tmpctx.font = `${style} ${size}px Arial`;
    const DTWidth = tmpctx.measureText(text).width + 8;
    const planeWidth = DTWidth * ratio;

    const text2 = materials.createText({width: DTWidth, height: DTHeight, text});
    text2.textGround.drawText(text, 0, null, `${style} ${size}px Arial`, "#fff", null, true);

    mesh.createPlane({
        width: planeWidth,
        height,
        position: {
            x: inCenterX ? x : x - planeWidth / 2,
            y,
            z: inCenterZ ? z : z + height / 2
        },
        rotation: {
            x: Math.PI / 2,
            y: Math.PI,
            z: 0
        },
        material: text2.matGround
    });

    return text2.textGround;
};

export {materials, mesh, drawText};
