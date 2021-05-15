let rnd = Math.random;
let ctx = canvas.getContext("2d");

resize();

let food;

let pts = Array(99).fill(0)
    .map(() => {
        let d = rnd() * Math.PI * 2;
        let size = rnd() * 22 + 11;
        return {
            size,
            dir: d,
            targetDir: d,
            speed: 1 + rnd() / size * 11,
            x: rnd() * w - w / 2,
            y: rnd() * h - h / 2
        };
    });

addEventListener("click", e => {
    food = [e.x - w / 2, e.y - h / 2, 1];
});

addEventListener("resize", resize);

function resize() {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    ctx.translate(w / 2, h / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
}

function draw(t) {
    requestAnimationFrame(draw);
    ctx.fillStyle = "#00000012";
    ctx.fillRect(-1e5, -1e5, 2e5, 2e5);
    ctx.fillStyle = "white";

    if (food && food[2]) {
        food[2] = Math.max(0, food[2] - 0.1);
        ctx.beginPath();
        ctx.arc(food[0], food[1], food[2]*10, 0, 2 * Math.PI);
        ctx.fill();
    }

    pts.forEach((p,i) => {
        p.dir = angleLerp(p.dir, p.targetDir, 0.1) + Math.sin(t/100+i)*0.03;
        p.x += Math.cos(p.dir) * p.speed;
        p.y += Math.sin(p.dir) * p.speed;

        if (Math.abs(p.x) > w / 2) p.x = -p.x;
        if (Math.abs(p.y) > h / 2) p.y = -p.y;
        
        if (rnd() > 0.995) 
            p.targetDir = rnd() * Math.PI * 2;
        
        if (food && food[2])
            p.targetDir = Math.atan2(
                food[1] - p.y, food[0] - p.x);
        
      
        paintA(p)
    });
}

function paintA(p, t){
    ctx.translate(p.x, p.y);
    ctx.rotate(p.dir + Math.PI / 2);
    ctx.font = `${p.size}px Arial`;
    ctx.fillText("A", 0, 0);
    ctx.rotate(-p.dir - Math.PI / 2);
    ctx.translate(-p.x, -p.y);
}

function angleLerp(a0,a1,t) {
    var max = Math.PI*2;
    var da = (a1 - a0) % max;
    return a0 + (2*da % max - da)*t;
}

requestAnimationFrame(draw);