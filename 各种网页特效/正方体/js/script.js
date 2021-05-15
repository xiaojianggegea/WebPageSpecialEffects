let cw = (canvas.width = window.innerWidth),
  cx = cw / 2;
let ch = (canvas.height = window.innerHeight),
  cy = ch / 2;
const ctx = canvas.getContext("2d");
let rid = null;
let gap = 40;
let r = 35;
let rects = [];

class Rect {
  constructor(pos, o) {
    this.pos = pos;
    this.rotatedPos = { x: pos.x, y: pos.y };
    this.r = r;
    this.points = [];
    this.rotatedPoints = [];

    this.rotOffset = o;
    this.getPoints();
  }

  getPoints() {
    for (let i = 0; i < 4; i++) {
      let angle = Math.PI / 4 + i * Math.PI / 2;
      let x = this.r * Math.cos(angle);
      let y = this.r * Math.sin(angle);
      let p = { x, y };
      let p1 = { x, y };
      this.points.push(p);
      this.rotatedPoints.push(p1);
    }
  }

  draw() {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.strokeStyle = "rgba(120,0,0,.7)";
    ctx.translate(this.rotatedPos.x, this.rotatedPos.y);
    ctx.beginPath();
    ctx.moveTo(this.rotatedPoints[0].x, this.rotatedPoints[0].y);
    for (let i = 1; i < this.rotatedPoints.length; i++) {
      ctx.lineTo(this.rotatedPoints[i].x, this.rotatedPoints[i].y);
    }
    ctx.lineTo(this.rotatedPoints[0].x, this.rotatedPoints[0].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  update(rot) {
    let _cos = Math.cos(rot * 2);
    let _sin = Math.sin(rot / 2);
    let cos = Math.cos(rot);
    let sin = Math.sin(rot);
    this.rotatedPos.x = -this.pos.x * _cos + this.pos.y * _sin;
    this.rotatedPos.y = this.pos.x * _sin + this.pos.y * _cos;
    this.points.forEach((p, i) => {
      this.rotatedPoints[i].x = p.x * cos - p.y * sin;
      this.rotatedPoints[i].y = p.x * sin + p.y * cos;
    });
  }
}

ctx.translate(cx, cy);
let j = 0;
for (let j = 0; j < 4; j++) {
  for (let i = 0; i < 4; i++) {
    let x = gap * (i + 1) + i * r;
    let y = gap * (j + 1) + j * r;
    let off = (i + j) * Math.PI / 18;

    rects.push(new Rect({ x, y }, off));
    rects.push(new Rect({ x, y: -y }, off));
    rects.push(new Rect({ x: -x, y: -y }, off));
    rects.push(new Rect({ x: -x, y }, off));
  }
}

let frames = 0;

function Frame() {
  rid = requestAnimationFrame(Frame);
  ctx.fillStyle = "rgba(100,0,0,.2)";
  ctx.fillRect(-cx, -cy, cw, ch);

  let rot = Math.sin((frames % 360) * Math.PI / 180);
  rects.map(r => {
    r.update(rot + r.rotOffset);
    r.draw();
  });

  frames++;
}

function Init() {
  if (rid) {
    window.cancelAnimationFrame(rid);
    rid = null;
  }
  (cw = canvas.width = window.innerWidth), (cx = cw / 2);
  (ch = canvas.height = window.innerHeight), (cy = ch / 2);
  ctx.translate(cx, cy);
  Frame();
}

window.setTimeout(function() {
  Init();

  window.addEventListener("resize", Init, false);
}, 15);