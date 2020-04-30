// import * as _ from "p5/global";
import { Font, Image } from 'p5';
import p5 from 'p5';
import { readFile, quill } from './editor'
import { drawName } from './bezier'
import { TextBounds, Style, Asset, PortraitAsset, ImageData } from './style';
import { loadStyle, pointInPolygon } from './util'

export let style: Style;
let canvas: HTMLCanvasElement;
let offsetX = 0;
let offsetY = 0;
const canvasZoom = 0.75;

const inputs: { [id: string]: HTMLInputElement } = {
    name: document.getElementById("name") as HTMLInputElement,
    cost: document.getElementById("cost") as HTMLInputElement,
    attack: document.getElementById("attack") as HTMLInputElement,
    health: document.getElementById("health") as HTMLInputElement,
    effect: document.getElementById("effect") as HTMLInputElement,
    race: document.getElementById("race") as HTMLInputElement,
    durability: document.getElementById("durability") as HTMLInputElement,
    weaponAttack: document.getElementById("weapon-attack") as HTMLInputElement,
    armor: document.getElementById("armor") as HTMLInputElement,
    imageZoom: document.getElementById("image-zoom") as HTMLInputElement,
    imageSelect: document.getElementById("image-select") as HTMLInputElement
};

const inputNames: { [id: string]: string } = {
    "weaponAttack": "attack",
    "durability": "health"
}

const cardInputs: { [id: string]: string[] } = {
    minion: ["race", "cost", "attack", "health"],
    spell: ["cost"],
    weapon: ["cost", "weaponAttack", "durability"],
    hero_power: ["cost"],
    hero: ["cost", "armor"]
}

export const debug = false;
let cardImage: Image;

interface FontDetails {
    normal: Font,
    bold: Font,
    italic: Font,
    bolditalic: Font
}

const fontMap: { [id: string]: Font | FontDetails } = {
    "Belwe Bd BT": undefined,
    "Franklin Gothic FS": undefined
};

let p5funcs = (p5: p5) => {

    p5.preload = () => {
        loadStyle("assets/cards/styles/default/", (s: Style) => {
            style = s;
        });
        cardImage = p5.loadImage('assets/images/leeroy.png');
        fontMap["Franklin Gothic FS"] = {
            normal: p5.loadFont("assets/fonts/franklin-gothic.ttf"),
            bold: p5.loadFont("assets/fonts/franklin-gothic-bold.ttf"),
            italic: p5.loadFont("assets/fonts/franklin-gothic-italic.ttf"),
            bolditalic: p5.loadFont("assets/fonts/franklin-gothic-bolditalic.ttf"),
        }
        fontMap["Belwe Bd BT"] = p5.loadFont("assets/fonts/Belwe-Bold.woff");
    }

    p5.setup = () => {
        const p5Canvas = p5.createCanvas(670, 1000);
        const container = document.getElementById("canvas") as HTMLDivElement;
        p5Canvas.parent(container);
        canvas = (p5Canvas as any).canvas;
        canvas.style.zoom = canvasZoom.toString();
        p5.noLoop();
        inputs.imageZoom.oninput = updateZoom;
        inputs.imageSelect.oninput = readFile;
        inputs.effect.onkeyup = () => { p5.redraw() };

        const domInputs: any = document.getElementsByTagName("input");
        for (const input of domInputs) {
            input.onkeyup = p5.redraw;
        }
        const resetButton = document.getElementById("reset-image");
        resetButton.onclick = resetImage;
    }

    p5.mouseClicked = () => {
        p5.redraw();
    }

    p5.draw = () => {
        p5.clear();
        const cardType = getType();

        showInputs(cardType);
        const rarity = getRarity();
        if (style !== undefined) {
            drawCardImage(cardType);
            if (cardType != "hero_power") {
                drawAsset(style[cardType].classDecoration.image, getClass());
                if (rarity == "legendary") {
                    drawAsset(style[cardType].elite.image);
                }
                drawAsset(style[cardType].custom.custom.image, "base");
                drawAsset(style[cardType].rarity.image, rarity);
            }

            for (let type of cardInputs[cardType]) {
                let inputType = type;
                if (Object.keys(inputNames).includes(type)) {
                    inputType = inputNames[type];
                }
                if (type != "race" || inputs[inputType].value != "") {
                    drawAsset(style[cardType][inputType].image);
                    drawText(style[cardType][inputType], inputs[inputType].value);
                }
            }

            drawAsset(style[cardType].name.image);

            p5.fill(style[cardType].name.font.color);
            p5.stroke(style[cardType].name.font.outline);
            p5.textFont(fontMap[style[cardType].name.font.family]);
            p5.strokeWeight(7);
            p5.textSize(style[cardType].name.font.size);
            p5.textAlign(p5.LEFT, p5.CENTER);
            const fontString = `${style[cardType].name.font.size}px ${style[cardType].name.font.family}`;
            console.log(fontString);
            drawName(inputs.name.value, fontString, style[cardType].name.font.outline, cardType, canvas);

            drawDescription(style[cardType].description);
        }
    }

    p5.mouseReleased = () => {
        p5.noLoop();
    }

    p5.mouseDragged = (e: MouseEvent) => {
        if (e.which == 0 || (p5.mouseX < 0 || p5.mouseY < 0 || p5.mouseX > p5.width * canvasZoom || p5.mouseY > p5.height * canvasZoom)) {
            p5.noLoop();
            return;
        } else {
            p5.loop();
        }
        offsetX += e.movementX;
        offsetY += e.movementY;
    }

    function drawCardImage(cardType: string) {
        style[cardType].portrait.image.assets.default = cardImage;
        maskImage(style[cardType].portrait as PortraitAsset);
        drawAsset(style[cardType].base.image);
    }

    function maskImage(asset: PortraitAsset) {
        let img = getScaledImage(asset.image.assets.default.get() as Image, asset);
        img.resize(asset.image.width, asset.image.height);
        let shape = asset.clip.points.map((val) => [val.x - asset.image.x, val.y - asset.image.y]);
        img.loadPixels();
        for (let x = 0; x < img.width; x++) {
            for (let y = 0; y < img.height; y++) {
                let index = (x + y * img.width) * 4;
                if (!pointInPolygon([x, y], shape)) {
                    img.pixels[index + 3] = 0;
                }
            }
        }
        img.updatePixels();
        p5.image(img, asset.image.x, asset.image.y, asset.image.width, asset.image.height);
    }

    function getScaledImage(img: Image, asset: Asset): Image {
        const zoom = 1.0 / Number(inputs.imageZoom.value);
        const offsetXSpeed = zoom * img.width / asset.image.width;
        const offsetYSpeed = zoom * img.height / asset.image.height;
        const aspectRatio = img.height / img.width;
        let imgWidth = img.width * zoom * aspectRatio;
        let imgHeight = img.height * zoom;
        let x = (img.width - imgWidth) / 2;
        let y = (img.height - imgHeight) / 2;
        return img.get(x - offsetX * offsetXSpeed, y - offsetY * offsetYSpeed, imgWidth, imgHeight) as Image;
    }

    function drawAsset(img: ImageData, name = 'default') {
        if (img && img.assets && img.assets[name]) {
            p5.image(img.assets[name], img.x, img.y, img.width, img.height);
        }
    }

    function drawText(asset: Asset, txt: string) {
        p5.fill(asset.font.color);
        p5.textFont(fontMap[asset.font.family]);
        p5.textAlign(p5.CENTER, p5.TOP);
        p5.textSize(asset.font.size);
        p5.strokeWeight(asset.font.size > 100 ? 10 : 7);
        p5.stroke(asset.font.outline);
        const centerX = (asset.text.x * 2 + asset.text.width) / 2;
        const centerY = (asset.text.y * 2 - asset.text.height) / 2 + 20;
        p5.text(txt, centerX, centerY);
    }

    function drawDescription(asset: Asset) {
        p5.fill(asset.font.color);
        p5.noStroke();
        p5.textSize(asset.font.size);
        const fonts = fontMap[asset.font.family] as FontDetails;
        const textX = asset.text.x;
        const textY = asset.text.y;
        const width = asset.text.width;
        const height = asset.text.height;

        const formatGroups = quill.getContents().ops;
        let lines = [];
        let lineLength = 0;
        let line = {
            words: [] as TextBounds[],
            width: 0
        };
        for (let j = 0; j < formatGroups.length; j++) {
            let formatGroup = formatGroups[j];
            let font = fonts.normal;

            if (formatGroup.attributes) {
                if (formatGroup.attributes.bold && formatGroup.attributes.italic) {
                    font = fonts.bolditalic;
                } else if (formatGroup.attributes.bold) {
                    font = fonts.bold;
                } else if (formatGroup.attributes.italic) {
                    font = fonts.italic;
                }
            }
            p5.textFont(font);
            let text = formatGroup.insert.toString();
            let textWords = text.split(/[\s]+/);
            let nextGroup = formatGroups[j + 1];
            let lastSpace = text.charAt(text.length - 1) == " " || (nextGroup && nextGroup.insert.toString().charAt(0) == " ");
            for (let i = 0; i < textWords.length; i++) {
                let textWord = textWords[i];
                if (textWord == "") {
                    continue;
                }
                let boundWord = textWord + (i == textWords.length - 1 && !lastSpace ? "" : " ");
                let bounds = font.textBounds(boundWord, 0, 0, asset.font.size) as TextBounds;
                bounds.h += p5.textDescent();
                bounds.word = textWord;
                bounds.font = font;
                if (lineLength + bounds.w <= width) {
                    lineLength += bounds.w;
                    line.words.push(bounds);
                    line.width += bounds.w;
                } else {
                    lines.push(line);
                    lineLength = bounds.w;
                    line = {
                        words: [bounds],
                        width: bounds.w
                    };
                }
            }
        }
        lines.push(line);
        const h = textHeight(lines);

        let lineX = textX;
        let y = textY + (height - h) / 2 + (h / lines.length) / 4;
        for (let lineWords of lines) {
            let x = lineX + (width - lineWords.width) / 2;
            let maxH = 0;
            for (let bounds of lineWords.words) {
                p5.textFont(bounds.font);
                p5.text(bounds.word, x, y);
                x += bounds.w;
                maxH = Math.max(maxH, bounds.h);
            }
            y += maxH;
        }
    }

    function textHeight(lines: { words: TextBounds[] }[]) {
        let h = 0;
        for (let line of lines) {
            let lineHeight = 0;
            for (let word of line.words) {
                lineHeight = Math.max(word.h, lineHeight);
            }
            h += lineHeight;
        }
        return h;
    }

    function getRarity() {
        let checked = document.querySelector("input[name=rarity]:checked");
        let rarity = "legendary";
        if (checked) {
            rarity = document.querySelector("input[name=rarity]:checked").id.replace("rarity-", "");
        }
        return rarity;
    }

    function getClass() {
        let checked = document.querySelector("input[name=class]:checked");
        let className = "neutral";
        if (checked) {
            className = document.querySelector("input[name=class]:checked").id.replace("class-", "");
        }
        return className;
    }

    function getType() {
        let checked = document.querySelector("input[name=type]:checked");
        let typeName = "minion";
        if (checked) {
            typeName = document.querySelector("input[name=type]:checked").id.replace("type-", "");
        }
        return typeName;
    }


    function showInputs(cardType: string) {
        const inputList: any = document.getElementsByClassName("input-optional");
        for (let element of inputList) {
            if (cardInputs[cardType].includes(element.id.substring("input-".length))) {
                element.style.display = "flex";
            } else {
                element.style.display = "none";
            }
        }
    }
}

export const ctx = new p5(p5funcs);

export function updateCardImage(image: Image) {
    cardImage = image;
    ctx.redraw();
}

function updateZoom() {
    let zoomTracker = document.getElementById("zoom-percent");
    let zoom = Number(inputs.imageZoom.value);
    zoomTracker.textContent = Math.round(zoom * 100) + "%";
    ctx.redraw();
}

function resetImage() {
    offsetX = 0;
    offsetY = 0;
    inputs.imageZoom.value = "1";
    updateZoom();
}

