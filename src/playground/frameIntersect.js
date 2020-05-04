import * as BABYLON from "babylonjs";
import {materials, drawText} from "./materials";

const createMeshByIntersect = ({x, y, z, scene, width, height}) => {
    const box1 = new BABYLON.MeshBuilder.CreateBox("plane", {height, width, depth: 0.001}, scene);
    const box2 = new BABYLON.MeshBuilder.CreateBox("plane", {
        height: height - 0.5,
        width: width - 0.5,
        depth: 0.001
    }, scene);

    box1.isVisible = false;
    box2.isVisible = false;

    const aCSG = BABYLON.CSG.FromMesh(box1);
    const cCSG = BABYLON.CSG.FromMesh(box2);

    const subCSG = aCSG.subtract(cCSG);
    const newMesh = subCSG.toMesh("csg", materials['white'], scene);
    newMesh.position = new BABYLON.Vector3(x, y, z);
    newMesh.rotation.x = Math.PI / 2;

    return newMesh;
};

const createFrame = ({x, y, z, scene, width, height, text}) => {
    return {
        frame: createMeshByIntersect({x, y, z, scene, width, height}),
        text: drawText({x, y, z: z, text, size: 48, height: 3, multiplier: 3, inCenterX: true, inCenterZ: true})
    };
};

export {createFrame};
