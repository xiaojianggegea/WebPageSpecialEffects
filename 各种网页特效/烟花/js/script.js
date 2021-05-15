var RENDERER = {
	MAX_GENERATOR_COUNT : 5,
	GENERATOR_AREA_WIDTH : 300,
	
	init : function(){
		this.setParameters();
		this.setup();
		this.reconstructMethods();
		this.bindEvent();
		this.render();
	},
	setParameters : function(){
		this.$window = $(window);
		this.$container = $('#jsi-sparkler-container');
		this.$canvas = $('<canvas />');
		this.context = this.$canvas.appendTo(this.$container).get(0).getContext('2d');
		this.generators= [];
		this.resizeIds = [];
	},
	setup : function(){
		this.generators.length = 0;
		this.resizeIds.length = 0;
		this.width = this.$container.width();
		this.height = this.$container.height();
		this.timeCount = this.TIME_COUNT;
		this.$canvas.attr({width : this.width, height : this.height});
		this.createGenerators();
	},
	createGenerators : function(){
		var count = Math.max(1, Math.min(Math.floor(this.width / this.GENERATOR_AREA_WIDTH), this.MAX_GENERATOR_COUNT));
		
		this.generatorAreaWidth = this.width / count;
		
		for(var i = 0; i < count; i++){
			this.generators.push(new GENERATOR(this, i));
		}
	},
	watchWindowSize : function(){
		while(this.resizeIds.length > 0){
			clearTimeout(this.resizeIds.pop());
		}
		this.tmpWidth = this.$window.width();
		this.tmpHeight = this.$window.height();
		this.resizeIds.push(setTimeout(this.jdugeToStopResize, this.RESIZE_INTERVAL));
	},
	jdugeToStopResize : function(){
		var width = this.$window.width(),
			height = this.$window.height(),
			stopped = (width == this.tmpWidth && height == this.tmpHeight);
			
		this.tmpWidth = width;
		this.tmpHeight = height;
		
		if(stopped){
			this.setup();
		}
	},
	reconstructMethods : function(){
		this.watchWindowSize = this.watchWindowSize.bind(this);
		this.jdugeToStopResize = this.jdugeToStopResize.bind(this);
		this.render = this.render.bind(this);
	},
	bindEvent : function(){
		this.$window.on('resize', this.watchWindowSize);
	},
	render : function(){
		requestAnimationFrame(this.render);
		this.context.clearRect(0, 0, this.width, this.height);
		
		for(var i = 0, count = this.generators.length; i < count; i++){
			this.generators[i].render(this.context);
		}
	}
};
var GENERATOR = function(renderer, index){
	this.renderer = renderer;
	this.index = index;
	this.init();
};
GENERATOR.prototype = {
	MAX_GENERATION_COUNT : 5,
	GENERATION_RATE : 0.01,
	MAX_STABILITY_COUNT : 20,
	MAX_VELOCITY : 6,
	CORE_RADIUS : 8,
	MAX_CORE_LUMINANCE : 90,
	DELTA_CORE_LUMIMANCE : 0.8,
	GRAVITY : 0.1,
	
	init : function(){
		this.status = 0;
		this.x = Math.round(this.renderer.generatorAreaWidth * (this.index + 0.5 + this.getRandomValue(-1, 1) / 5));
		this.y = -this.CORE_RADIUS;
		this.maxY = this.renderer.height * this.getRandomValue(2, 3) / 5;
		this.maxTimeCount = Math.ceil((this.maxY + this.CORE_RADIUS) / (this.MAX_VELOCITY / this.getRandomValue(1, 3)));
		this.timeCount = 0;
		this.coreY = -this.CORE_RADIUS;
		this.coreVy = 0;
		this.hue = Math.round(this.getRandomValue(0, 360));
		this.generationRate = 0;
		this.generationCount = 0;
		this.stabilityCount = this.MAX_STABILITY_COUNT / this.getRandomValue(1, 2);
		this.coreLuminance = 30;
		this.particles = [];
	},
	createParticles : function(){
		for(var i = 0, count = this.generationCount; i < count; i++){
			this.particles.push(new PARTICLE(this));
		}
	},
	getRandomValue : function(min, max){
		return min + (max - min) * Math.random();
	},
	controlStatus : function(){
		switch(this.status){
		case 0:
			this.timeCount++;
			this.y = this.maxY * this.easeInOutQuad(this.timeCount / this.maxTimeCount);
			this.coreY = this.y;
			
			if(this.timeCount == this.maxTimeCount){
				this.status = 1;
			}
			break;
		case 1:
			this.coreLuminance += this.DELTA_CORE_LUMIMANCE;
			
			if(this.coreLuminance >= this.MAX_CORE_LUMINANCE){
				this.status = 2;
			}
			break;
		case 2:
			this.generationRate += this.GENERATION_RATE;
			this.generationCount = Math.pow(this.generationRate, 3) * this.MAX_GENERATION_COUNT;
			
			if(this.generationCount >= this.MAX_GENERATION_COUNT){
				this.status = 3;
			}
			break;
		case 3:
			if(--this.stabilityCount <= 0){
				this.status = 4;
			}
			break;
		case 4:
			this.generationRate -= this.GENERATION_RATE;
			this.generationCount = Math.pow(this.generationRate, 3) * this.MAX_GENERATION_COUNT;
			
			if(this.generationCount <= 0){
				this.status = 5;
			}
			break;
		case 5:
			if(this.timeCount > 0){
				this.timeCount--;
			}
			this.y = this.maxY * this.easeInOutQuad(this.timeCount / this.maxTimeCount);
			this.coreY += this.coreVy;
			this.coreVy += this.GRAVITY;
			
			if(this.timeCount <= 0 && this.coreY > this.renderer.height + this.CORE_RADIUS && this.particles.length == 0){
				this.init();
			}
		}
	},
	easeInOutQuad: function(t){
		return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
	},
	render : function(context){
		var gradient = context.createLinearGradient(0, 0, 0, this.y);
		gradient.addColorStop(0,  'hsl(' + this.hue + ', 60%, ' + 10 * (1 + 2 * (1 - this.y / (this.renderer.height * 3 / 5))) + '%)');
		gradient.addColorStop(1,  'hsl(' + this.hue + ', 60%, 30%)');
		context.strokeStyle = gradient;
		context.lineWidth = 3;
		context.beginPath();
		context.moveTo(this.x, 0);
		context.lineTo(this.x, this.y);
		context.stroke();
		
		gradient = context.createRadialGradient(0, 0, 0, 0, 0, this.CORE_RADIUS);
		gradient.addColorStop(0,  'hsl(' + this.hue + ', 60%, ' + this.coreLuminance + '%)');
		gradient.addColorStop(0.5,  'hsl(' + this.hue + ', 60%, ' + this.coreLuminance * 2 / 3 + '%)');
		gradient.addColorStop(1,  'hsl(' + this.hue + ', 60%, ' + this.coreLuminance / 2 + '%)');
		context.save();
		context.fillStyle = gradient;
		context.translate(this.x, this.coreY);
		context.scale(0.5, 1);
		context.beginPath();
		context.arc(0, 0, this.CORE_RADIUS, 0, Math.PI * 2, false);
		context.fill();
		context.restore();
		
		if(this.status >= 2 && this.status <= 5){
			context.save();
			context.globalCompositeOperation = 'lighter';
			
			for(var i = this.particles.length - 1; i >= 0; i--){
				if(!this.particles[i].render(context)){
					this.particles.splice(i, 1);
				}
			}
			context.restore();
			this.createParticles();
		}
		this.controlStatus();
	}
};
var PARTICLE = function(generator){
	this.generator = generator;
	this.init();
};
PARTICLE.prototype = {
	RADIUS : 15,
	MAX_STROKE_COUNT : 8,
	MAX_VELOCITY : 3,
	MAX_OFFSET : 5,
	SCALE_RATE : 0.01,
	GRAVITY : 0.08,
	FRICTION : 0.99,
	
	init : function(){
		var velocity = this.generator.getRandomValue(this.MAX_VELOCITY / 2, this.MAX_VELOCITY),
			theta = this.generator.getRandomValue(0, Math.PI * 2),
			offset = this.generator.getRandomValue(0, this.MAX_OFFSET);
			
		this.x = this.generator.x + offset * Math.cos(theta);
		this.y = this.generator.y + offset * Math.sin(theta);
		this.radius = this.RADIUS;
		this.strokeCount = Math.round(this.generator.getRandomValue(4, this.MAX_STROKE_COUNT)) * 2;
		this.radian = Math.PI * 2 / this.strokeCount;
		this.vx = velocity * Math.cos(theta);
		this.vy = velocity * Math.sin(theta);
		this.theta = 0;
		this.scale = 1;
	},
	render : function(context){
		context.save();
		context.translate(this.x, this.y);
		context.scale(this.scale, this.scale);
		context.rotate(this.theta);
		
		if(Math.random() > 0.3){
			context.fillStyle = 'hsl(' + this.generator.hue + ', 60%, 30%)';
			context.beginPath();
			context.moveTo(0, -this.radius);
			
			for(var i = 0, count = this.strokeCount; i < count; i++){
				var radius = this.radius / ((i % 2 == 0) ? 1 : 5);
				context.lineTo(radius * Math.sin(this.radian * i), -radius * Math.cos(this.radian * i));
			}
			context.closePath();
			context.fill();
		}
		context.restore();
		
		this.x += this.vx;
		this.y += this.vy;
		this.vy += this.GRAVITY;
		this.vx *= this.FRICTION;
		this.vy *= this.FRICTION;
		this.scale -= this.SCALE_RATE;
		this.theta += Math.PI / 100 * this.vx;
		this.theta %= Math.PI * 2;
		
		return this.scale >= 0;
	}
};
$(function(){
	RENDERER.init();
});