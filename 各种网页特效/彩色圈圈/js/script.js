class Particle {
  constructor(angle, br) {
    this.x = 0;
    this.y = 0;
    this.angle = angle;
    this.baseRadius = br;
    this.offset = Math.random() * 5;
  }

  move(px = 0, py = 0) {
    let xc = Math.cos(this.angle);
    let yc = Math.sin(this.angle);

    let r = this.baseRadius;
    this.x = r * Math.sin(this.angle) * 16 + px * 0.25;
    this.y = -r * Math.cos(this.angle) * 16 + py * 0.25;
    this.angle += Math.random() * 0.02 * torf();
  }

  /** 中心点 */
  draw(ctx, x0, y0) {
    ctx.fillRect(x0 + this.x, y0 + this.y, 2, 2);
  }}


let canvas;
let ctx;
let particles;
let circles = [];
let circlesNum = 2;


let Switch = false;
function torf() {
  Switch = !Switch;
  return Switch ? 1 : 0;
}

function reset() {
  w = canvas.width = 1600;
  h = canvas.height = 800;
}

function setup() {
  canvas = document.querySelector(".stage");
  ctx = canvas.getContext("2d");
  reset();
  window.addEventListener("resize", reset);
  for (let i = 0; i < circlesNum; i += .5) {
    circles.push(setupParticles(i));
  }
}

// 颜色函数
function RGB2Color(r, g, b) {
  return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function byte2Hex(n) {
  let r = Number(n).toString(16);
  let re = n <= 15 ? '0' + r : r;
  return re.toUpperCase();
}

function colorful(i) {
  let frequency = .05;
  red = parseInt(Math.sin(frequency * i + 0) * 127 + 128);
  green = parseInt(Math.sin(frequency * i + 2) * 127 + 128);
  blue = parseInt(Math.sin(frequency * i + 4) * 127 + 128);
  return RGB2Color(red, green, blue);
}

function setupParticles(level) {
  let particles = [];
  for (let angle = 0; angle < Math.PI * 2; angle += 0.01) {
    let p = new Particle(angle, h * 0.0080 * (level + 1));
    particles.push(p);
  }
  return particles;
}

function draw() {
  requestAnimationFrame(draw);
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, w, h);

  let prevX = 0;
  let prevY = 0;

  circles.forEach(c => {
    c.forEach((p, i) => {
      p.move(prevX, prevY);
      prevX = p.x;
      prevY = p.y;
      ctx.fillStyle = colorful(i);
      p.draw(ctx, w / 2, h / 2);
    });
  });
}

setup();
draw();