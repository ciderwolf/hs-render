let style, canvas;
let offsetX = 0;
let offsetY = 0;
const canvasZoom = 0.75;

const inputs = {
    name: document.getElementById("name"),
    cost: document.getElementById("cost"),
    attack: document.getElementById("attack"),
    health: document.getElementById("health"),
    effect: document.getElementById("effect"),
    race: document.getElementById("race"),
    durability: document.getElementById("durability"),
    weaponAttack: document.getElementById("weapon-attack"),
    armor: document.getElementById("armor"),
    imageZoom: document.getElementById("image-zoom"),
    imageSelect: document.getElementById("image-select")
};

const inputNames = {
    "weaponAttack": "attack",
    "durability": "health"
}

const cardInputs = {
    minion: ["race", "cost", "attack", "health"],
    spell: ["cost"],
    weapon: ["cost", "weaponAttack", "durability"],
    hero_power: ["cost"],
    hero: ["cost", "armor"]
}

const debug = false;
let leeroy;

const fontMap = {
    "Belwe Bd BT": "Belwe",
    "Franklin Gothic FS": undefined
};

function preload() {
    loadStyle("assets/cards/styles/default/", s => {
        style = s;
    });
    leeroy = loadImage('assets/images/leeroy.png');
    fontMap["Franklin Gothic FS"] = {
        normal: loadFont("assets/fonts/franklin-gothic.ttf"),
        bold: loadFont("assets/fonts/franklin-gothic-bold.ttf"),
        italic: loadFont("assets/fonts/franklin-gothic-italic.ttf"),
        bolditalic: loadFont("assets/fonts/franklin-gothic-bolditalic.ttf"),
    }
    fontMap["Belwe Bd BT"] = loadFont("assets/fonts/Belwe-Bold.woff");
}

function setup() {
    let p5Canvas = createCanvas(670, 1000);
    p5Canvas.parent(document.getElementById("canvas"));
    canvas = p5Canvas.canvas;
    canvas.style.zoom = canvasZoom;
    noLoop();
    inputs.imageZoom.oninput = updateZoom;
    inputs.imageSelect.oninput = readFile;
    inputs.effect.onkeyup = redraw;
    for (let input of document.getElementsByTagName("input")) {
        input.onkeyup = redraw;
    }
}

function mouseClicked() {
    redraw();
}

function updateZoom() {
    let zoomTracker = document.getElementById("zoom-percent");
    let zoom = inputs.imageZoom.value;
    zoomTracker.textContent = round(zoom * 100) + "%";
    redraw();
}

function draw() {
    clear();
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

        fill(style[cardType].name.font.color);
        stroke(style[cardType].name.font.outline);
        textFont(fontMap[style[cardType].name.font.family]);
        strokeWeight(7);
        textSize(style[cardType].name.font.size);
        textAlign(LEFT, CENTER);
        drawName(inputs.name.value, cardType, canvas);

        drawDescription(style[cardType].description);
    }
}

function drawCardImage(cardType) {
    style[cardType].portrait.image.assets.default = leeroy;
    maskImage(style[cardType].portrait);
    drawAsset(style[cardType].base.image);
}

function mouseReleased() {
    noLoop();
}

function mouseDragged(e) {
    if (e.which == 0 || (mouseX < 0 || mouseY < 0 || mouseX > width * canvasZoom || mouseY > height * canvasZoom)) {
        noLoop();
        return;
    } else {
        loop();
    }
    offsetX += e.movementX;
    offsetY += e.movementY;
}

function resetImage() {
    offsetX = 0;
    offsetY = 0;
    inputs.imageZoom.value = 1;
    updateZoom();
}

function maskImage(asset) {
    let img = getScaledImage(asset.image.assets.default.get(), asset);
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
    image(img, asset.image.x, asset.image.y, asset.image.width, asset.image.height);
}

function getScaledImage(img, asset) {
    const zoom = 1.0 / inputs.imageZoom.value;
    const offsetXSpeed = zoom * img.width / asset.image.width;
    const offsetYSpeed = zoom * img.height / asset.image.height;
    const aspectRatio = img.height / img.width;
    let imgWidth = img.width * zoom * aspectRatio;
    let imgHeight = img.height * zoom;
    let x = (img.width - imgWidth) / 2;
    let y = (img.height - imgHeight) / 2;
    return img.get(x - offsetX * offsetXSpeed, y - offsetY * offsetYSpeed, imgWidth, imgHeight);
}

function drawAsset(img, name = 'default') {
    if (img && img.assets && img.assets[name]) {
        image(img.assets[name], img.x, img.y, img.width, img.height);
    }
}

function drawText(asset, txt) {
    fill(asset.font.color);
    textFont(fontMap[asset.font.family]);
    textAlign(CENTER, TOP);
    textSize(asset.font.size);
    strokeWeight(asset.font.size > 100 ? 10 : 7);
    stroke(asset.font.outline);
    const centerX = (asset.text.x * 2 + asset.text.width) / 2;
    const centerY = (asset.text.y * 2 - asset.text.height) / 2 + 12;
    text(txt, centerX, centerY);
}

function drawDescription(asset) {
    fill(asset.font.color);
    noStroke();
    textSize(asset.font.size);
    const fonts = fontMap[asset.font.family];
    const textX = asset.text.x;
    const textY = asset.text.y;
    const width = asset.text.width;
    const height = asset.text.height;

    const formatGroups = quill.getContents().ops;
    let lines = [];
    let lineLength = 0;
    let line = {
        words: [],
        width: 0
    };
    for (let j in formatGroups) {
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
        textFont(font);
        let textWords = formatGroup.insert.split(/[\s]+/);
        let nextGroup = formatGroups[Number(j) + 1];
        let lastSpace = formatGroup.insert.charAt(formatGroup.insert.length - 1) == " " || (nextGroup && nextGroup.insert.charAt(0) == " ");
        for (let i in textWords) {
            let textWord = textWords[i];
            if (textWord == "") {
                continue;
            }
            let boundWord = textWord + (i == textWords.length - 1 && !lastSpace ? "" : " ");
            let bounds = font.textBounds(boundWord, 0, 0, asset.font.size);
            bounds.h += textDescent();
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
    for (lineWords of lines) {
        let x = lineX + (width - lineWords.width) / 2;
        let maxH = 0;
        for (bounds of lineWords.words) {
            textFont(bounds.font);
            text(bounds.word, x, y);
            x += bounds.w;
            maxH = max(maxH, bounds.h);
        }
        y += maxH;
    }
}

function textHeight(lines) {
    let h = 0;
    for (let line of lines) {
        let lineHeight = 0;
        for (let word of line.words) {
            lineHeight = max(word.h, lineHeight);
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


function showInputs(cardType) {
    for (let element of document.getElementsByClassName("input-optional")) {
        if (cardInputs[cardType].includes(element.id.substring("input-".length))) {
            element.style.display = "flex";
        } else {
            element.style.display = "none";
        }
    }
}