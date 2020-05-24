import * as GUI from "babylonjs-gui";

const interfaces = {
    createText(values) {
        const textNode = new GUI.TextBlock();
        textNode.text = values.text;
        textNode.fontSize = values.fontSize;
        textNode.fontWeight = 'bold';

        this.setShadow(textNode);
        this._generalParams(textNode, values);

        return textNode;
    },

    createImgButton(values) {
        const buttonNode = new GUI.Button.CreateImageOnlyButton(values.url, values.url);
        buttonNode.thickness = values.thickness;
        buttonNode.width = values.width;
        buttonNode.hoverCursor = 'pointer';
        buttonNode.isPointerBlocker = true;

        this._generalParams(buttonNode, values);

        return buttonNode;
    },

    setShadow(node) {
        node.shadowColor = '#808080';
        node.shadowBlur = 5;
        node.shadowOffsetY = 3;
    },

    _generalParams(node, {top = 0, left = 0, vAl = 'VERTICAL_ALIGNMENT_CENTER', hAl = 'HORIZONTAL_ALIGNMENT_CENTER', height}) {
        node.color = '#ffffff';
        node.top = top;
        node.left = left;
        node.height = height;
        node.verticalAlignment = BABYLON.GUI.Control[vAl];
        node.horizontalAlignment = BABYLON.GUI.Control[hAl];
    }
};

export {interfaces};
