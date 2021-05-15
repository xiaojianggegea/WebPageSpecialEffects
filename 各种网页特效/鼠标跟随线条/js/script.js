"use strict";

const backgroundColor = "rgba(0,0,10,0.5)";
const baseHue = rand(360);
const rangeHue = 180;
const tentacleCount = 30;
const segmentCountMin = 10;
const segmentCountMax = 20;
const segmentLengthMin = 20;
const segmentLengthMax = 40;
const colonyRadius = 200;

let canvas;
let ctx;
let center;
let mouse;
let tick;
let simplex;
let tentacle;
let tentacles;

class Tentacle {
  constructor(x, y, segmentNum, baseLength, baseDirection) {
    this.base = [x, y];
    this.position = [x, y];
    this.target = [x, y];
    this.segmentNum = segmentNum;
    this.baseLength = baseLength;
    this.baseDirection = baseDirection;
    this.segmentProps = ["x1", "y1", "x2", "y2", "l", "d", "h"];
    this.segments = new PropsArray(segmentNum, this.segmentProps);
    this.follow = false;

    let i = this.segments.length - this.segmentProps.length;
    let x1, y1, x2, y2, l, d, h;

    l = this.baseLength;
    d = this.baseDirection;

    for (; i >= 0; i -= this.segmentProps.length) {
      x1 = x2 || this.position[0];
      y1 = y2 || this.position[1];
      x2 = x1 - l * cos(d);
      y2 = y1 - l * sin(d);
      d += 0.309;
      l *= 0.98;
      h = baseHue + fadeIn(i, this.segments.length) * rangeHue;
      this.segments.set([x1, y1, x2, y2, l, d, h], i);
    }
  }
  setCtx(ctx) {
    this.ctx = ctx;
  }
  setTarget(target) {
    this.target = target;
  }
  updateBase() {
    let t = simplex.noise3D(this.base[0] * 0.005, this.base[1] * 0.005, tick * 0.005) * TAU;

    this.base.lerp([
    this.base[0] + 20 * cos(t),
    this.base[1] + 20 * sin(t)],
    0.025);
  }
  async update() {
    let target = this.position;
    let i = this.segments.length - this.segmentProps.length;
    let promises = [];

    this.position.lerp(this.target, 0.015);
    !this.follow && this.updateBase();

    for (; i >= 0; i -= this.segmentProps.length) {
      promises.push(
      new Promise(resolve => {
        let [x1, y1, x2, y2, l, d, h] = this.segments.get(i);
        let t, n, tn;

        x1 = target[0];
        y1 = target[1];
        t = angle(x1, y1, x2, y2);
        n = simplex.noise3D(
        x1 * 0.005,
        y1 * 0.005,
        (i + tick) * 0.005);

        tn = t + n * PI * 0.0125;
        x2 = x1 + l * cos(tn);
        y2 = y1 + l * sin(tn);
        d = t;

        target = [x2, y2];

        this.segments.set([x1, y1, x2, y2, l, d], i);
        this.drawSegment(x1, y1, x2, y2, h, n, i);

        resolve();
      }));

    }

    await Promise.all(promises);
  }
  drawSegment(x1, y1, x2, y2, h, n, i) {
    const fn = fadeInOut(1 + n, 2);
    const fa = fadeInOut(i, this.segments.length);
    const a = 0.25 * (fn + fa);

    this.ctx.beginPath();
    this.ctx.strokeStyle = `hsla(${h}, 50%, 50%, ${a})`;
    this.ctx.moveTo(x2, y2);
    this.ctx.lineTo(x1, y1);
    this.ctx.stroke();
    this.ctx.beginPath();

    this.ctx.closePath();
    this.ctx.strokeStyle = `hsla(${h}, 50%, 50%, ${a + 0.5})`;
    this.ctx.arc(x1, y1, fn * 3, 0, TAU);
    this.ctx.stroke();
    this.ctx.closePath();
  }}


function setup() {
  tick = 0;
  simplex = new SimplexNoise();
  mouse = [0, 0];
  createCanvas();
  resize();
  tentacles = [];

  let i, t;

  for (i = 0; i < tentacleCount; i++) {
    t = i / tentacleCount * TAU;
    tentacle = new Tentacle(
    center[0] + colonyRadius * cos(rand(TAU)),
    center[1] + colonyRadius * sin(rand(TAU)),
    round(randIn(segmentCountMin, segmentCountMax)),
    round(randIn(segmentLengthMin, segmentLengthMax)),
    t);

    tentacle.setCtx(ctx.a);
    tentacles.push(tentacle);
  }

  loop();
}

function createCanvas() {
  canvas = {
    a: document.createElement("canvas"),
    b: document.createElement("canvas") };

  canvas.b.style = `
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	`;
  document.body.appendChild(canvas.b);
  ctx = {
    a: canvas.a.getContext("2d"),
    b: canvas.b.getContext("2d") };

  center = [0.5 * canvas.a.width, 0.5 * canvas.a.height];
}

function resize() {
  const { innerWidth, innerHeight } = window;

  canvas.a.width = innerWidth;
  canvas.a.height = innerHeight;

  ctx.a.drawImage(canvas.b, 0, 0);

  canvas.b.width = innerWidth;
  canvas.b.height = innerHeight;

  ctx.b.drawImage(canvas.a, 0, 0);

  center[0] = 0.5 * canvas.a.width;
  center[1] = 0.5 * canvas.a.height;
}

function renderBackground() {
  ctx.a.clearRect(0, 0, canvas.b.width, canvas.b.height);
  ctx.b.fillStyle = backgroundColor;
  ctx.b.fillRect(0, 0, canvas.a.width, canvas.a.height);
}

function renderGlow() {
  ctx.b.save();
  ctx.b.filter = "blur(8px) brightness(200%)";
  ctx.b.globalCompositeOperation = "lighter";
  ctx.b.drawImage(canvas.a, 0, 0);
  ctx.b.restore();

  ctx.b.save();
  ctx.b.filter = "blur(4px) brightness(200%)";
  ctx.b.globalCompositeOperation = "lighter";
  ctx.b.drawImage(canvas.a, 0, 0);
  ctx.b.restore();
}

function renderToScreen() {
  ctx.b.save();
  ctx.b.globalCompositeOperation = "lighter";
  ctx.b.drawImage(canvas.a, 0, 0);
  ctx.b.restore();
}

async function loop() {
  tick++;

  renderBackground();

  await Promise.all(tentacles.map(tentacle => tentacle.update()));

  renderGlow();
  renderToScreen();

  window.requestAnimationFrame(loop);
}

window.addEventListener("load", setup);
window.addEventListener("resize", resize);
window.addEventListener("mousemove", e => {
  tentacles.forEach((tentacle, i) => {
    const t = i / tentacles.length * TAU;
    tentacle.setTarget([e.clientX + colonyRadius * cos(t + tick * 0.05), e.clientY + colonyRadius * sin(t + tick * 0.05)]);
    tentacle.follow = true;
  });
});
window.addEventListener("mouseout", () => {
  tentacles.forEach(tentacle => {
    tentacle.base = [
    center[0] + colonyRadius * cos(rand(TAU)),
    center[1] + colonyRadius * sin(rand(TAU))];

    tentacle.setTarget(tentacle.base);
    tentacle.follow = false;
  });
});