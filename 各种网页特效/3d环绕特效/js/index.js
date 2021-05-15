
const r = new THREE.WebGLRenderer({ antialias: false });
document.body.appendChild(r.domElement);


const {
  EffectComposer, 
  EffectPass, 
  BloomEffect,
  DepthEffect, 
  RenderPass, 
  GodRaysEffect
} = POSTPROCESSING;
const renderer = new EffectComposer(r);
console.log(POSTPROCESSING)


let scene = new THREE.Scene();

fogColor = new THREE.Color(0x252545);
 
scene.background = fogColor;
scene.fog = new THREE.Fog(fogColor, 0.0025, 25);


let camera = new THREE.PerspectiveCamera(
  45, window.innerWidth / window.innerHeight, 
  0.1, 2000);
		camera.position.set( 0, 0,10 );



let rig = new THREE.Group();
camera.rotation.y = -0.2;
    rig.add(camera)
scene.add(rig);
rig.rotateZ(1)



let group = new THREE.Group();

let cubeGeometry = bufferedField(5,250);
let cubeMaterial = new THREE.MeshStandardMaterial({color:0x808080});
let cubeMaterial2 = new THREE.MeshStandardMaterial({color:0x202020, roughness: 0.3});
let cubeMaterial3 = new THREE.RawShaderMaterial({
      uniforms: {
          time: { value: 1.0 }
      },
      vertexShader: document.getElementById( 'vertexShader' ).textContent,
      fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
      transparent: true,
      blending:THREE.AdditiveBlending
    });

let cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial2);
    group.add(cubeMesh)

let otherMesh = new THREE.Mesh(bufferedField(30), cubeMaterial2);
    otherMesh.rotateX(0);
    otherMesh.rotateZ(4);

let otherMesh2 = new THREE.Mesh(bufferedField(7), cubeMaterial);
    otherMesh2.rotateX(0);
    otherMesh2.rotateZ(1);
    group.add(otherMesh2);

let otherMesh3 = new THREE.Mesh(bufferedField(1,50, 0.01), cubeMaterial);
    otherMesh3.rotateX(0);
    otherMesh3.rotateZ(1);
    group.add(otherMesh3);

let otherMesh4 = new THREE.Mesh(new THREE.SphereGeometry(1, ), cubeMaterial3);
    otherMesh4.rotateX(0);
    otherMesh4.rotateZ(1);
    group.add(otherMesh4);
let otherMesh5 = new THREE.Mesh(new THREE.SphereGeometry(0.2, ), cubeMaterial2);
    otherMesh5.rotateX(3);
    otherMesh5.rotateZ(1);
    group.add(otherMesh5);


let canvas1 = document.createElement("canvas");
    canvas1.width = canvas1.height = 512;
let ctx1 = canvas1.getContext("2d");
document.body.appendChild(canvas1);
    drawLines(ctx1);
let tex1 = new THREE.CanvasTexture(canvas1);
  
var plane1 = new THREE.PlaneGeometry(5, 5);
var planeMaterial1 = new THREE.MeshBasicMaterial( { map: tex1, side: THREE.DoubleSide, transparent:true, blending: THREE.AdditiveBlending, alphaTest: 0.2 } );

let planeMesh1 = new THREE.Mesh(plane1, planeMaterial1);

group.add(planeMesh1)

for(let i = 0; i < 100; i++) {
  let pulse = Math.random()*60;
  let m = planeMesh1.clone();
      m.rotation.set(Math.random()*5, Math.random()*5, Math.random()*5)
      m.scale.set(pulse, pulse, pulse)
      m.needsUpdate = true;
  group.add(m)
}




const effectPass2 = new EffectPass(camera, new BloomEffect());
effectPass2.renderToScreen = true;

renderer.addPass(new RenderPass(scene, camera));

renderer.addPass(effectPass2); 


// var geometry =  new THREE.DecalGeometry(cubeMesh, new THREE.Vector3(0, 0, 2), new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 2, 2));
// // var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// //var mesh = new THREE.Mesh( geometry, material );

// let material = new THREE.MeshBasicMaterial({
//       color: 0xffffff,
//       transparent: true,
//       blending:THREE.AdditiveBlending
//     });

// let mesh = new THREE.Mesh(geometry, material);

// group.add(mesh)


scene.add(group);


let light = new THREE.PointLight( 0xff00ff, 1, 100 )
    light.position.set(0,0,0);
    light.lookAt(new THREE.Vector3())

let light2 = new THREE.AmbientLight( 0x202060, 1, 100 )
    light2.position.set(0,0,0);
    light2.lookAt(new THREE.Vector3())

let light3 = new THREE.SpotLight( 0x602030, 4, 40, 3, 1,2 )
    light3.position.set(0,0,20);
    light3.lookAt(new THREE.Vector3())
scene.add(light3)

scene.add(light);
scene.add(light2);


function resize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	//renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", resize)

window.addEventListener("mousemove", orbitCamera)

let target = new THREE.Vector2();
let current = new THREE.Vector2();

function orbitCamera(e) {
  const { clientX, clientY } = e;
  target.x = (clientX / window.innerWidth);
  target.y = (clientY / window.innerHeight);
 
}
let t = 0;
function draw() {
  requestAnimationFrame(draw);
  cubeMaterial3.uniforms.time.value += 0.5;
  let pulse = 1.1 + (Math.sin(t)*0.5)
  light.intensity = pulse;
  cubeMesh.rotateY(0.001)
  
  otherMesh.rotateY(0.001);
	otherMesh.needsUpdate = true;
  otherMesh2.rotateY(0.001);
	otherMesh2.needsUpdate = true;
  otherMesh3.rotateZ(0.0005);
	otherMesh3.needsUpdate = true;
  otherMesh4.scale.set(pulse*0.6, pulse*0.6, pulse*0.6)
  otherMesh4.needsUpdate = true;
   //mesh.rotateY(0.02);
   //mesh.rotateZ(0.03)
  group.rotation.y = 0.5-target.x;
  group.rotation.z = 0.5-target.y;
  group.rotation.x = (0.5-Math.sin(t*0.1))*0.6;
  t+= 0.02;
  
  
  camera.rotation.y = (0.5-Math.cos(t*0.1))*0.24;
  camera.rotation.x = (0.5-Math.sin(t*0.1))*0.1;
  renderer.render(t);
}

resize();
draw();

function polarRandom(scale = 3, range =1) {
  return (1-(Math.random()*2)) * scale;
}

function bufferedField(size = 5, count = 128, scale = 0.5) {
  		var bufferGeometry = new THREE.BufferGeometry();
			var radius = 125;
			var positions = [];
			var normals = [];
			var colors = [];
			var vector = new THREE.Vector3();
  	  var color = new THREE.Color( 0xffffff );
			var cube = new THREE.BoxGeometry(0.25, 0.25, 0.25);
			var geometry = new THREE.Geometry();
          var axis = new THREE.Vector3( 0, 1, 0 );
        var angle = Math.PI / 2;
			for ( var i = 1, l = count; i <= l; i ++ ) {
  
          vector.set(polarRandom(.5), polarRandom(1), size);

				
        vector.applyAxisAngle( axis, Math.random()*Math.PI*2 );
				geometry.copy( new THREE.BoxGeometry(0.1+Math.random(), 0.1+Math.random(), 0.1+Math.random()*scale) );
				geometry.lookAt( vector );
				geometry.translate( vector.x, vector.y, vector.z );
				color.setHSL( ( i / l ), 1.0, 0.7 );
				geometry.faces.forEach( function ( face ) {
					positions.push( geometry.vertices[ face.a ].x );
					positions.push( geometry.vertices[ face.a ].y );
					positions.push( geometry.vertices[ face.a ].z );
					positions.push( geometry.vertices[ face.b ].x );
					positions.push( geometry.vertices[ face.b ].y );
					positions.push( geometry.vertices[ face.b ].z );
					positions.push( geometry.vertices[ face.c ].x );
					positions.push( geometry.vertices[ face.c ].y );
					positions.push( geometry.vertices[ face.c ].z );
					normals.push( face.normal.x );
					normals.push( face.normal.y );
					normals.push( face.normal.z );
					normals.push( face.normal.x );
					normals.push( face.normal.y );
					normals.push( face.normal.z );
					normals.push( face.normal.x );
					normals.push( face.normal.y );
					normals.push( face.normal.z );
					colors.push( color.r );
					colors.push( color.g );
					colors.push( color.b );
					colors.push( color.r );
					colors.push( color.g );
					colors.push( color.b );
					colors.push( color.r );
					colors.push( color.g );
					colors.push( color.b );
				} );
			}
			bufferGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
			bufferGeometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
			bufferGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
  return bufferGeometry;
}

function drawLines(ctx) {
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 3;
ctx.arc(256, 256, 250, 0, 2 * Math.PI);
ctx.stroke();
  
}