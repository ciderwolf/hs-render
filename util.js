function rgb(r, g, b) {
    r = clamp(r, 0, 255).toString(16).padStart(2, '0');
    g = clamp(g, 0, 255).toString(16).padStart(2, '0');
    b = clamp(b, 0, 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}

function clamp(value, min, max) {
    if (value > max) {
        return max;
    }
    else if (value < min) {
        return min;
    }
    return value;
}

function pointInPolygon(point, shape) {
    let x = point[0];
    let y = point[1];

    let inside = false;
    for (let i = 0, j = shape.length - 1; i < shape.length; j = i++) {
        let xi = shape[i][0];
        let yi = shape[i][1];
        let xj = shape[j][0];
        let yj = shape[j][1];

        let intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) {
            inside = !inside;
        }
    }

    return inside;
}


async function loadStyle(path, callback) {
    const response = await fetch(path + "data.json");
    let style = await response.json();

    for (type of Object.keys(style)) {
        if (style[type] instanceof Object) {
            for (property in style[type]) {
                if (Object.keys(style[type][property]).includes('image')) {
                    for (imagePath in style[type][property].image.assets) {
                        const image = loadImage(path + style[type][property].image.assets[imagePath]);
                        style[type][property].image.assets[imagePath] = image;
                    }
                }
                else if (property == "custom") {
                    style[type][property].custom.image.assets.base = loadImage(path + style[type][property].custom.image.assets.base);
                }
            }
        }
    }

    callback(style);
}