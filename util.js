function rgb(r, g, b) {
    r = clamp(r, 0, 255).toString(16).padStart(2, '0');
    g = clamp(g, 0, 255).toString(16).padStart(2, '0');
    b = clamp(b, 0, 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}

function clamp(value, min, max) {
    if(value > max) {
        return max;
    }
    else if(value < min) {
        return min;
    }
    return value;
}

async function loadStyle(path, callback) {
    const response = await fetch(path + "data.json");
    let style = await response.json();

    for(type of Object.keys(style))  {
        if(style[type] instanceof Object) {
            for(property in style[type]) {
                if(Object.keys(style[type][property]).includes('image')) {
                    for(imagePath in style[type][property].image.assets) {
                        const image = loadImage(path + style[type][property].image.assets[imagePath]);
                        style[type][property].image.assets[imagePath] = image;
                    }
                }
                else if(property == "custom") {
                    style[type][property].custom.image.assets.base = loadImage(path + style[type][property].custom.image.assets.base);
                }
            }
        }
    }

    callback(style);
}