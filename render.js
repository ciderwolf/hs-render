let style, canvas;

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
};

const inputNames = {
    "weapon-attack": "attack",
    "durability": "health"
}

const cardInputs = {
    minion: ["race", "cost", "attack", "health"],
    spell: ["cost"],
    weapon: ["cost", "weapon-attack", "durability"],
    hero_power: ["cost"],
    hero: ["cost", "armor"]
}

let cardType = "weapon";

const debug = false;
let leeroy;

const fontMap = {
    "Belwe Bd BT": "Belwe",
    "Franklin Gothic FS": undefined
};

function preload() {
    loadStyle("assets/cards/styles/default/", s => {
        style = s;
        style.minion.portrait.image.assets.default = leeroy;
        style.spell.portrait.image.assets.default = leeroy;
    });
    leeroy = loadImage('assets/images/leeroy.png');
    fontMap["Franklin Gothic FS"] = {
        normal: loadFont("assets/fonts/franklin-gothic.ttf"),
        bold: loadFont("assets/fonts/Untitled2Bold.ttf")
    }
}

function setup() {
    let p5Canvas = createCanvas(670, 1000);
    p5Canvas.parent(document.getElementById("canvas"));
    canvas = p5Canvas.canvas;
    noLoop();
    let inputs = document.getElementsByTagName("input");
    for(let input of inputs) {
        input.oninput = draw;
    }
    document.getElementById("effect").onkeyup = draw;
}

function draw() {
    background(155);
    showInputs(cardType);
    const rarity = getRarity();
    if(style !== undefined) {
        drawAsset(style[cardType].portrait.image);
        drawAsset(style[cardType].base.image);
        drawAsset(style[cardType].classDecoration.image, getClass());
        if(rarity == "legendary") {
            drawAsset(style[cardType].elite.image);
        }
        drawAsset(style[cardType].rarity.image, rarity);

        for(let type of cardInputs[cardType]) {
            let inputType = type;
            if(Object.keys(inputNames).includes(type)) {
                inputType = inputNames[type];
            }
            drawAsset(style[cardType][inputType].image);
            drawText(style[cardType][inputType], inputs[inputType].value);
        }

        drawAsset(style[cardType].name.image);

        fill(style[cardType].name.font.color);
        stroke(style[cardType].name.font.outline);
        textFont(fontMap[style[cardType].name.font.family]);
        strokeWeight(8);
        textSize(style[cardType].name.font.size);
        textAlign(LEFT, CENTER);
        drawName(inputs.name.value, cardType, canvas);

        drawDescription(style[cardType].description);
    }
}

function drawAsset(img, name='default') {
    if(img.assets[name]) {
        image(img.assets[name], img.x, img.y, img.width, img.height);
    }
}

function drawText(asset, txt) {
    fill(asset.font.color);
    textFont(fontMap[asset.font.family]);
    textAlign(LEFT, TOP)
    textSize(asset.font.size);
    strokeWeight(10);
    stroke(0);

    text(txt, asset.text.x + (asset.text.width - textWidth(txt))/2, asset.text.y - 15);

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

    const words = inputs.effect.value.split(/[\s]+/);
    let lines = [];
    let lineLength = 0;
    let line = {
        words: [],
        width: 0
    };
    let longestLine = 0;
    for(let word of words) {
        let font = fonts.normal;
        if(word.includes("Charge") || word.includes("Battlecry")) {
            font = fonts.bold;
        }
        textFont(font);
        let bounds = font.textBounds(word + " ", 0, 0, asset.font.size);
        bounds.h += textDescent();
        bounds.word = word;
        bounds.font = font;
        if(lineLength + bounds.w <= width) {
            lineLength += bounds.w;
            line.words.push(bounds);
            line.width += bounds.w;
        } else {
            lines.push(line);
            longestLine = max(longestLine, lineLength);
            lineLength = bounds.w;
            line = {
                words: [bounds],
                width: bounds.w
            };
        }
    }
    lines.push(line);

    const h = textHeight(lines);
    
    let lineX = textX;
    let y = textY + (height - h) / 2 + (h / lines.length) / 4;
    for(lineWords of lines) {
        let x = lineX + (width - lineWords.width) / 2;
        let maxH = 0;
        for(bounds of lineWords.words) {
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
    for(let line of lines) {
        let lineHeight = 0;
        for(let word of line.words) {
            lineHeight = max(word.h, lineHeight);
        }
        h += lineHeight;
    }
    return h;
}


function getRarity() {
    let checked = document.querySelector("input[name=rarity]:checked");
    let rarity = "legendary";
    if(checked) {
        rarity = document.querySelector("input[name=rarity]:checked").id.replace("rarity-", "");
    }
    return rarity;
}

function getClass() {
    let checked = document.querySelector("input[name=class]:checked");
    let className = "neutral";
    if(checked) {
        className = document.querySelector("input[name=class]:checked").id.replace("class-", "");
    }
    return className;
}

function showInputs(cardType) {
    for(let element of document.getElementsByClassName("input-optional")) {
        if(cardInputs[cardType].includes(element.id.substring("input-".length))) {
            element.style.display = "flex";
        } else {
            element.style.display = "none";
        }
    }
}