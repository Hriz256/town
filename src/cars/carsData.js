const vehicles = {
    'golf': {
        islandPosition: {x: 0, y: 0.5, z: 0.2},
        details: {
            position: {
                x: 0,
                y: -0.5,
                z: -0.1
            },
            size: {
                width: 1.85,
                height: 1,
                depth: 4.4
            },
            wheelRotation: {
                x: Math.PI / 2,
                y: 0,
                z: 0
            },
        }
    },
    'car': {
        islandPosition: {x: 0, y: 0.9, z: 0.2},
        details: {
            position: {
                x: 0,
                y: 0,
                z: 0
            },
            size: {
                width: 1.85,
                height: 1,
                depth: 4.4
            },
            wheelRotation: 0,
        }
    },
    'VW': {
        islandPosition: {x: 0, y: 0.5, z: 0.2},
        details: {
            position: {
                x: 0,
                y: -0.5,
                z: 0
            },
            size: {
                width: 3,
                height: 1,
                depth: 7.3
            },
            wheelRotation: {
                x: 0,
                y: 0,
                z: Math.PI / 2
            },
        }
    },
    'bus': {
        islandPosition: {x: 0, y: 0.5, z: 0.6},
    }
};

export {vehicles};
