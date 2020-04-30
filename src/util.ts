import { ctx } from './render'
import { Style } from "./style";

export function pointInPolygon(point: [number, number], shape: number[][]) {
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

export function redrawImage() {
    redraw();
}

export async function loadStyle(path: string, callback: ((s: Style) => void)) {
    const response = await fetch(path + "data.json");
    let style: any = await response.json();

    for (let type of Object.keys(style)) {
        if (style[type] instanceof Object) {
            for (let property in style[type]) {
                if (Object.keys(style[type][property]).includes('image')) {
                    for (let imagePath in style[type][property].image.assets) {
                        const image = ctx.loadImage(path + style[type][property].image.assets[imagePath]);
                        style[type][property].image.assets[imagePath] = image;
                    }
                }
                else if (property == "custom") {
                    style[type][property].custom.image.assets.base = ctx.loadImage(path + style[type][property].custom.image.assets.base);
                }
            }
        }
    }

    callback(style);
}