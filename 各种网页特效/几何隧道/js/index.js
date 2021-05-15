// Get window size
const canvas = document.querySelector('canvas');

canvas.width = window.innerWidth, 
canvas.height = window.innerHeight;

// Create a WebGL renderer
const renderer = new THREE.WebGLRenderer({ canvas });

renderer.setSize(canvas.width, canvas.height);

// Create an empty scene
const scene = new THREE.Scene();

// Create a perpsective camera
const camera = new THREE.PerspectiveCamera(65, canvas.width / canvas.height, 0.001, 1000);
camera.position.z = 400;

const ambient = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambient);

// Array of points
const points = [
  [68.5,185.5],
  [1,262.5],
  [270.9,281.9],
  [345.5,212.8],
  [178,155.7],
  [240.3,72.3],
  [153.4,0.6],
  [52.6,53.3],
  [68.5,185.5]
];

// Convert the array of points into vertices
for (let i = 0; i < points.length; i++) {
  const x = points[i][0],
        y = 0,
        z = points[i][1];

  points[i] = new THREE.Vector3(x, y, z);
}

// Create a path from the points
const path = new THREE.CatmullRomCurve3(points);

// Create the tube geometry from the path
const geometry = new THREE.TubeGeometry(path, 600, 8, 32, true);

// Set a different color on each face
for (let i = 0, j = geometry.faces.length; i < j; i++) {
  geometry.faces[i].color = new THREE.Color("hsl("+Math.floor((Math.random()*20)+200)+", 60%, 60%)");
}

//Basic material
const material = new THREE.MeshLambertMaterial({
  side: THREE.BackSide,
  vertexColors: THREE.FaceColors // We need to tell ThreeJs that the colors are coming from the faces
});

// Create a mesh
const tube = new THREE.Mesh(geometry, material);

// Add tube into the scene
scene.add(tube);

// Create a point light in our scene
const light = new THREE.PointLight(0xffffff, 1, 100);
scene.add(light);

let percentage = 0;

function render() {
  percentage += 0.00025; // Speed

  const p1 = path.getPointAt(percentage % 1),
        p2 = path.getPointAt((percentage + 0.03) % 1);

  camera.position.set(p1.x, p1.y, p1.z);
  camera.lookAt(p2);

  light.position.set(p2.x, p2.y, p2.z);

  // Render the scene
  renderer.render(scene, camera);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);