import p5, { Font } from 'p5';
import { Quill } from 'quill';
import { FontDetails } from './render';
import { TextBounds } from './style';

interface FontInfo {
    name: string;
    font: Font;
}

class LineComponent {
    text: string;
    font: FontInfo;

    height: number = 0;
    width: number = 0;

    constructor(text: string, font: FontInfo) {
        this.text = text;
        this.font = font;
    }

    calculateWidth(p5: p5): number {
        p5.textFont(this.font.font);
        const bounds = this.font.font.textBounds(this.text, 0, 0) as TextBounds;

        this.height = bounds.h;
        this.width = p5.textWidth(this.text);
        if (this.height == -Infinity) {
            this.height = 0;
        }
        if (this.width == -Infinity) {
            this.width = 0;
        }
        return this.width;
    }
}

export class Line {
    components: LineComponent[];
    textWidth: number;

    constructor(components: LineComponent[] = []) {
        this.components = components;
        this.textWidth = 0;
    }

    add(text: string, font: FontInfo) {
        if (this.willAppend(font)) {
            const last = this.components[this.components.length - 1];
            last.text += text;
        } else {
            this.components.push(new LineComponent(text, font));
        }
    }

    lastBreak(): LineComponent[] {
        let comps: LineComponent[] = [];
        const reversed = [...this.components].reverse();
        for (const comp of reversed) {
            if (comp.text.includes(" ")) {
                const index = comp.text.lastIndexOf(" ");
                const end = comp.text.substring(index + 1);
                const start = comp.text.substring(0, index);
                comp.text = start;
                comps.unshift(new LineComponent(end, comp.font));
                break;
            } else {
                comps.unshift(comp);
            }
        }
        return comps;
    }

    private willAppend(font: FontInfo): boolean {
        return this.components.length > 0 &&
            this.components[this.components.length - 1].font.name == font.name;
    }

    width(p5: p5, test: LineComponent): number {
        let width = 0;
        for (const comp of this.components) {
            width += comp.calculateWidth(p5);
        }
        this.textWidth = width;
        if (test) {
            width += test.calculateWidth(p5);
        }
        return width;
    }
}

type FontKey = "bold" | "italic" | "bolditalic" | "normal";
function getFont(bold: boolean, italic: boolean): FontKey {
    let out = "";
    if (bold) {
        out += "bold";
    }
    if (italic) {
        out += "italic";
    }
    if (out == "") {
        out = "normal";
    }
    return out as FontKey;
}

export function splitText(quill: Quill, p5: p5, fonts: FontDetails, width: number): Line[] {
    const formats = quill.getContents().ops;
    const lines: Line[] = [];
    let line = new Line();

    for (const fmt of formats) {
        if (fmt.attributes === undefined) {
            fmt.attributes = {};
        }
        for (const letter of fmt.insert.toString()) {
            if (letter == "\n") {
                lines.push(line);
                line = new Line();
            } else {
                const name = getFont(fmt.attributes.bold, fmt.attributes.italic);
                const font = fonts[name];
                const test = new LineComponent(letter, { font, name });
                const newLineWidth = line.width(p5, test);
                if (newLineWidth > width) {
                    const hanging = line.lastBreak();
                    line.width(p5, null);
                    lines.push(line);
                    line = new Line(hanging);
                }
                line.add(test.text, test.font);
            }
        }
    }
    lines.push(line);
    return lines;
}