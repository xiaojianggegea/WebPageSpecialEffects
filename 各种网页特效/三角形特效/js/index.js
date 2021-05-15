var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
w = ctx.canvas.width = window.innerWidth;
h = ctx.canvas.height = window.innerHeight;

window.onresize = function() {
  w = ctx.canvas.width = window.innerWidth;
  h = ctx.canvas.height = window.innerHeight;
};

obj=[];
par=[];
nt=0;

function mainEmitter(){
  obj.push({
    x:  0,
    y:  0,
    v:  Math.random()*1+0.4,
    a:  Math.round(Math.random()*360),
    s:  Math.random()*(12-6)+6,
    h:  Math.random()*(80-160)+160,
    st: Date.now(),
    lt: Math.random()*(20000-5000)+5000
  });
}

function particleEmitter(){
  count = Math.round(Math.random()*(10-5)+5);
  oi = Math.floor(Math.random()*obj.length);
  for(i=0; i<count; i++){
    par.push({
      x:  obj[oi].x+w/2,
      y:  obj[oi].y+h/2,
      s:  Math.random()*(6-2)+2,
      h:  Math.random()*(80-160)+160,
      sh: Math.random() >= 0.5,
      vx: Math.random()*(-2-2)+2,
      vy: Math.random()*(-2-2)+2,
      st: Date.now(),
      lt: Math.random()*(2000-1000)+1000
    });
  }
  obj[oi] = obj[obj.length-1];
  obj.pop();
}

function clear(){
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fillRect(0,0,w,h);
  ctx.fill();
}

function draw(){
  nt += 0.005;
  
  for(i=0; i<obj.length; i++){
    var op = (Date.now()-obj[i].st)/obj[i].lt;
    var rgb = chroma.hsl(obj[i].h, 0.5, 0.5).rgb();
    dirX = obj[i].a + noise.simplex2(obj[i].x/600, nt)*70;
    dirY = obj[i].a + noise.simplex2(obj[i].y/600, nt)*70;
    nx = vec(obj[i].v, dirX).x;
    ny = vec(obj[i].v, dirY).y;
    
    ctx.save();
    ctx.translate(obj[i].x+w/2, obj[i].y+h/2);
    ctx.rotate(dirY*Math.PI/180);
    ctx.beginPath();
    ctx.strokeStyle = "rgba("+rgb[0]+","+rgb[1]+","+rgb[2]+","+(1-op)+")";
    ctx.lineWidth = obj[i].s*0.15;
    ctx.shadowBlur = 0;
    ctx.moveTo(0, 0);
    ctx.lineTo(obj[i].s, obj[i].s*2);
    ctx.lineTo(-obj[i].s, obj[i].s*2);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    
    if(Date.now() > obj[i].st+obj[i].lt){
      obj[i] = obj[obj.length-1];
      obj.pop();
    } else {
      obj[i].x += nx;
      obj[i].y += ny;
    }
  }
  
  
  for(i=0; i<par.length; i++){
    var op = (Date.now()-par[i].st)/par[i].lt;
    var rgb = chroma.hsl(par[i].h, 0.5, 0.5).rgb();
    
    ctx.beginPath();
    ctx.strokeStyle = "rgba("+rgb[0]+","+rgb[1]+","+rgb[2]+","+(1-op)+")";
    ctx.shadowColor = "rgba("+rgb[0]+","+rgb[1]+","+rgb[2]+","+(1-op)+")";
    ctx.shadowBlur = 10;
    if(par[i].sh){
      ctx.arc(par[i].x, par[i].y, par[i].s, 0, Math.PI*2);
    } else {
      ctx.rect(par[i].x, par[i].y, par[i].s, par[i].s);
    }
    ctx.stroke();
    ctx.closePath();
    
    if(Date.now() > par[i].st+par[i].lt){
      par[i] = par[par.length-1];
      par.pop();
    } else {
      par[i].x += par[i].vx;
      par[i].y += par[i].vy;
    }
  }
  
  ctx.arc(w/2, h/2, 50, 0, 2*Math.PI);
  ctx.fillStyle = "#000";
  ctx.fill();
}

function vec(v, a){
   var ar = (a*Math.PI)/180;
   var x = v * Math.sin(ar);
   var y = -v * Math.cos(ar);
  return {x:x, y:y};
}

function render(){
  clear();
  draw();
  requestAnimationFrame(render);
}render();

function mainEmitterTimer() {
  var interval = Math.round(Math.random() * (100 - 30)) + 30;
  setTimeout(function() {
    mainEmitter();
    mainEmitterTimer();
  }, interval);
}mainEmitterTimer();

function particleEmitterTimer() {
  var interval = Math.round(Math.random() * (600 - 200)) + 200;
  setTimeout(function() {
    particleEmitter();
    particleEmitterTimer();
  }, interval);
}particleEmitterTimer();