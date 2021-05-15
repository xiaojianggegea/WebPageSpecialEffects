var requestAnimationFrame = window.requestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.msRequestAnimationFrame;

var circlesGroup = document.querySelector('.heart__fill-circles-group');
var circlesElems = document.querySelectorAll('.heart__mask-circle');
var circles = [];
var groupAnimatedClass = 'heart__fill-circles-group--animated';

var pathLength = 350;
var maxSteps = 80;
var maxR = 50;
var rStep = maxR / maxSteps;

var Circle = function Circle(_ref) {var elem = _ref.elem,direction = _ref.direction,delay = _ref.delay;
  this.elem = elem;
  this.direction = direction;
  this.delay = delay;

  this.resetValues();
};

Circle.prototype.resetValues = function () {
  var angleDeg = Math.round(Math.random() * 360);
  var angleRad = angleDeg * Math.PI / 180;

  this.x = pathLength * Math.sin(angleRad); // c * sin(B)
  this.y = pathLength * Math.cos(angleRad); // c * cos(B)
  this.xStep = this.x / maxSteps;
  this.yStep = this.y / maxSteps;
  this.currentStep = maxSteps / 4.5;
};

Circle.prototype.changeProp = function () {var _this = this;
  var x = this.xStep * this.currentStep;
  var y = this.yStep * this.currentStep;

  if (this.direction === 1) {
    // right top
    y *= -1;
  } else
  if (this.direction === 2) {
    // right bottom
    // make nothing
  } else
  if (this.direction === 3) {
    // left bottom
    x *= -1;
  } else
  if (this.direction === 4) {
    // left top
    x *= -1;
    y *= -1;
  }

  this.currentStep++;

  this.elem.setAttribute('transform', 'translate(' + x + ', ' + y + ')');
  this.elem.setAttribute('r', Math.abs(maxSteps - this.currentStep) * rStep);

  if (this.currentStep >= maxSteps) {
    this.resetValues();
  }

  requestAnimationFrame(function () {
    _this.changeProp();
  });
};

function setInitial() {
  circles.forEach(function (circle) {
    circle.elem.setAttribute('transform', 'translate(0, 0)');
    circle.elem.setAttribute('r', maxR);
  });
};

var runAnimation = function runAnimation() {
  circles.forEach(function (circle, i) {
    setTimeout(function () {
      circle.resetValues();
      circle.changeProp();
    }, circle.delay);
  });
};

var prepareCircles = function prepareCircles() {
  circlesElems.forEach(function (elem, i) {
    var direction = Math.floor(Math.random() * 4) + 1;
    var circle = new Circle({
      elem: elem,
      direction: direction,
      delay: i * 100 });


    circles.push(circle);
  });
};

// ------------------------------

prepareCircles();
requestAnimationFrame(runAnimation);