let style, canvas;
let name, cost, attack, health, effect;
const debug = false;
let leeroy;

const fontMap = {
    "Belwe Bd BT": "Belwe",
    "Franklin Gothic FS": undefined
};

function preload() {
    loadStyle("assets/styles/default/", s => {
        style = s;
        style.minion.portrait.image.assets.default = leeroy;
    });
    leeroy = loadImage('assets/images/leeroy.png');
    bodyFont = loadFont("assets/fonts/franklin-gothic.ttf");
    fontMap["Franklin Gothic FS"] = bodyFont;
}

function setup() {
    canvas = createCanvas(670, 1000).canvas;
    name = createText("Name", "text", "Leeroy Jenkins");
    cost = createText("Cost", "number");
    attack = createText("Attack", "number");
    health = createText("Health", "number");
    effect = createText("Effect", "text");
    frameRate(10);
}

function createText(name, type, value="") {
    let input = document.createElement("input");
    input.type = type;
    input.id = name;
    input.value = value;
    let label = document.createElement("label");
    label.target = name;
    label.innerHTML = name + ": ";
    document.getElementById("inputs").appendChild(label);
    document.getElementById("inputs").appendChild(input);
    return input;
}

function draw() {
    background(155);
    let cardType = 'minion';
    if(style !== undefined) {
        drawAsset(style[cardType].portrait.image);
        drawAsset(style[cardType].base.image);
        drawAsset(style[cardType].classDecoration.image, "neutral");
        drawAsset(style[cardType].elite.image);
        drawAsset(style[cardType].rarity.image, "legendary");
        drawAsset(style[cardType].health.image);
        drawAsset(style[cardType].attack.image);
        drawAsset(style[cardType].cost.image);
        drawAsset(style[cardType].name.image);

        fill(style[cardType].name.font.color);
        stroke(style[cardType].name.font.outline);
        textFont(fontMap[style[cardType].name.font.family]);
        strokeWeight(8);
        textSize(style[cardType].name.font.size);
        textAlign(LEFT, CENTER);
        drawName(name.value, cardType, canvas);

        fill(style[cardType].description.font.color);
        noStroke();
        textFont(fontMap[style[cardType].description.font.family]);
        textSize(style[cardType].description.font.size);
        textSize(20);
        textAlign(CENTER);
        text(effect.value, style[cardType].description.text.x, style[cardType].description.text.y, style[cardType].description.text.width, style[cardType].description.text.height);
    }
    // noLoop();

}

function drawText(asset) {

}

function drawAsset(img, name='default') {
    image(img.assets[name], img.x, img.y, img.width, img.height);
}