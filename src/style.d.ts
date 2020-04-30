import { Font, Image } from "p5";

interface Point {
    x: number;
    y: number;
}

interface TextBounds {
    x: number;
    y: number;
    w: number;
    h: number;
    word: string;
    font: Font;
}

interface ImageData {
    assets: {
        [id: string]: Image
    },
    x: number,
    y: number,
    width: number,
    height: number
}

interface Asset {
    layer: number,
    image: ImageData,
    font: {
        color: string,
        outline: string,
        family: string,
        size: number
    },
    text: {
        x: number,
        y: number,
        width: number,
        height: number
    }
}

interface NameAsset extends Asset {
    textCurve: {
        start: Point;
        c1: Point;
        end: Point;
        c2: Point;
    }
}

interface PortraitAsset extends Asset {
    clip: {
        type: string,
        points: Point[]
    }
}


interface StyleType {
    [id: string]: any
}

interface MinionStyle extends StyleType {
    elite: Asset,
    health: Asset,
    cost: Asset,
    attack: Asset,
    name: NameAsset,
    description: Asset,
    multiClass: Asset,
    race: Asset,
    rarity: Asset,
    custom: any
    classDecoration: Asset,
    base: Asset,
    portrait: Asset
}

interface Style {
    // name: string,
    // width: number,
    // height: number,
    // minion: MinionStyle,
    // minion_premium: MinionStyle,
    [id: string]: MinionStyle
}