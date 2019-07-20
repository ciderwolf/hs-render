function drawName(name, cardType, canvas) {
    let ctx = canvas.getContext('2d');
    drawStack(name, ctx, cardType);
}

function drawStack(name, ctx, cardType) {
    let curve = style[cardType].name.textCurve;

    const ribbon = {maxChar: 50, startX: curve.start.x, startY: curve.start.y, 
              control1X: curve.c1.x, control1Y: curve.c1.y, 
              control2X: curve.c2.x, control2Y: curve.c2.y, 
              endX: curve.end.x, endY: curve.end.y};
    
    ctx.save();
    ctx.beginPath();
    
    ctx.moveTo(ribbon.startX,ribbon.startY);
    if(debug) {
        ctx.bezierCurveTo(ribbon.control1X, ribbon.control1Y,
            ribbon.control2X, ribbon.control2Y,
            ribbon.endX, ribbon.endY);
    }
    
    ctx.stroke();
    ctx.restore();
    
   fillRibbon(name, ribbon, ctx); 
}

function fillRibbon(str, ribbon, ctx) {

    let textCurve = [];
    let ribbonText = str.substring(0, ribbon.maxChar);
    let curveSample = 1000;


    let xDist = 0;
    for (let i = 0; i < curveSample; i++) {
        const a = new Bezier2(i / curveSample, ribbon.startX, ribbon.startY, ribbon.control1X, ribbon.control1Y, ribbon.control2X, ribbon.control2Y, ribbon.endX, ribbon.endY);
        const b = new Bezier2((i + 1) / curveSample, ribbon.startX, ribbon.startY, ribbon.control1X, ribbon.control1Y, ribbon.control2X, ribbon.control2Y, ribbon.endX, ribbon.endY);
        const c = new Bezier(a, b, xDist);
        xDist += c.dist;
        textCurve.push({bezier: a, curve: c.curve});
    }

    // letterPadding = ctx.measureText(" ").width / 4; 
    let letterPadding = 0;
    let textLength = ribbonText.length;
    let pixelWidth = Math.round(ctx.measureText(ribbonText).width);


    let totalPadding = (textLength - 1) * letterPadding;
    let totalLength = pixelWidth + totalPadding;
    let p = 0;

    let cDist = textCurve[curveSample-1].curve.cDist;

    let z = (cDist / 2) - (totalLength / 2);

    for (let i = 0; i < curveSample; i ++){
        if (textCurve[i].curve.cDist >= z) {
            p = i;
            break;
        }
    }

    for (let i = 0; i < textLength ; i++) {
        ctx.save();
        ctx.translate(textCurve[p].bezier.point.x, textCurve[p].bezier.point.y);
        ctx.rotate(textCurve[p].curve.rad);
        text(ribbonText[i], 0, 0);
        ctx.restore();
        
        let x1 = ctx.measureText(ribbonText[i]).width + letterPadding ;
        let x2 = 0;	
        for (let j = p; j < curveSample; j ++){
            x2 = x2 + textCurve[j].curve.dist;
            if (x2 >= x1) {
                p = j;
                break;
            }
        }
    }
}


class Bezier {
    constructor(b1, b2, xDist) {
        //Final stage which takes p, p+1 and calculates the rotation, distance on the path and accumulates the total distance
        this.rad = Math.atan(b1.point.mY / b1.point.mX);
        this.b2 = b2;
        this.b1 = b1;
        this.dist = Math.sqrt(((b2.x - b1.x) * (b2.x - b1.x)) + ((b2.y - b1.y) * (b2.y - b1.y)));
        this.curve = { rad: this.rad, dist: this.dist, cDist: xDist + this.dist};
    }
}
class BezierT {
    constructor(t, startX, startY, control1X, control1Y, control2X, control2Y, endX, endY) {
        //calculates the tangent line to a point in the curve; later used to calculate the degrees of rotation at this point.
        this.mx = (3 * (1 - t) * (1 - t) * (control1X - startX)) + ((6 * (1 - t) * t) * (control2X - control1X)) + (3 * t * t * (endX - control2X));
        this.my = (3 * (1 - t) * (1 - t) * (control1Y - startY)) + ((6 * (1 - t) * t) * (control2Y - control1Y)) + (3 * t * t * (endY - control2Y));
    }
}
class Bezier2 {
    constructor(t, startX, startY, control1X, control1Y, control2X, control2Y, endX, endY) {
        //Quadratic bezier curve plotter
        this.Bezier1 = new Bezier1(t, startX, startY, control1X, control1Y, control2X, control2Y);
        this.Bezier2 = new Bezier1(t, control1X, control1Y, control2X, control2Y, endX, endY);
        this.x = ((1 - t) * this.Bezier1.x) + (t * this.Bezier2.x);
        this.y = ((1 - t) * this.Bezier1.y) + (t * this.Bezier2.y);
        this.slope = new BezierT(t, startX, startY, control1X, control1Y, control2X, control2Y, endX, endY);
        this.point = { t: t, x: this.x, y: this.y, mX: this.slope.mx, mY: this.slope.my };
    }
}
class Bezier1 {
    constructor(t, startX, startY, control1X, control1Y, control2X, control2Y) {
        //linear bezier curve plotter; used recursivly in the quadratic bezier curve calculation
        this.x = ((1 - t) * (1 - t) * startX) + (2 * (1 - t) * t * control1X) + (t * t * control2X);
        this.y = ((1 - t) * (1 - t) * startY) + (2 * (1 - t) * t * control1Y) + (t * t * control2Y);
    }
}