function App() {
  const conf = {
    el: 'canvas',
    fov: 75,
    cameraZ: 140,
    background: 0x00001a,
    numCircles: 40,
    numPointsPerCircle: 1000 };


  let renderer, scene, camera, cameraCtrl, startTime;
  let width, height;

  const numPoints = conf.numCircles * conf.numPointsPerCircle;
  let points;

  const mouse = new THREE.Vector2(0.1, 0.5);
  const { randFloat: rnd, randFloatSpread: rndFS } = THREE.Math;

  init();

  function init() {
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById(conf.el) });
    camera = new THREE.PerspectiveCamera(conf.fov);
    camera.far = 10000;
    camera.position.z = conf.cameraZ;
    cameraCtrl = new THREE.OrbitControls(camera, renderer.domElement);
    cameraCtrl.enableKeys = false;
    cameraCtrl.enableDamping = true;
    cameraCtrl.dampingFactor = 0.1;
    cameraCtrl.rotateSpeed = 0.1;

    updateSize();
    window.addEventListener('resize', updateSize, false);
    renderer.domElement.addEventListener('mousemove', e => {
      mouse.x = e.clientX / width * 2 - 1;
      mouse.y = -(e.clientY / height) * 2 + 1;
    });

    startTime = Date.now();
    initScene();
    animate();
  }

  function initScene() {
    scene = new THREE.Scene();
    if (conf.background) scene.background = new THREE.Color(conf.background);

    const positions = new Float32Array(numPoints * 3);
    const colors = new Float32Array(numPoints * 3);
    const sizes = new Float32Array(numPoints);
    const rotations = new Float32Array(numPoints);
    const sCoef = new Float32Array(numPoints);
    const ci = new Float32Array(numPoints);
    const cj = new Float32Array(numPoints);

    const position = new THREE.Vector3();
    const cscale = chroma.scale([0x00b9e0, 0xff880a, 0x5f1b90, 0x7ec08d]);
    let index, color;
    for (let i = 0; i < conf.numCircles; i++) {
      for (let j = 0; j < conf.numPointsPerCircle; j++) {
        index = conf.numPointsPerCircle * i + j;
        position.set(rndFS(10), rndFS(10), rndFS(1.5 * (conf.numCircles - i)));
        position.toArray(positions, index * 3);
        color = new THREE.Color(cscale(rnd(0, 1)).hex());
        color.toArray(colors, index * 3);
        sizes[index] = rnd(2, 30);
        sCoef[index] = rnd(0.0001, 0.005);
        rotations[index] = rnd(0, Math.PI);
        ci[index] = i + 1;
        cj[index] = j + 1;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.addAttribute('rotation', new THREE.BufferAttribute(rotations, 1));
    geometry.addAttribute('sCoef', new THREE.BufferAttribute(sCoef, 1));
    geometry.addAttribute('ci', new THREE.BufferAttribute(ci, 1));
    geometry.addAttribute('cj', new THREE.BufferAttribute(cj, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: mouse },
        uTexture: { value: new THREE.TextureLoader().load('https://klevron.github.io/codepen/misc/star.png') },
        uRCoef: { value: 7 },
        uACoef: { value: 2 * Math.PI / conf.numPointsPerCircle } },

      vertexShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uRCoef;
      uniform float uACoef;
      attribute vec3 color;
      attribute float size;
      attribute float rotation;
      attribute float sCoef;
      attribute float ci;
      attribute float cj;
      varying vec4 vColor;
      varying float vRotation;
      void main() {
        vColor = vec4(color, 1.);
        vRotation = rotation;

        float rx = ci * uRCoef;
        float ry = rx * 0.6;
        float a = cj * uACoef;
        float t = uTime * 0.00005;
        vec2 p2 = vec2(cos(a+t) * rx, sin(a+t) * ry) + position.xy;

        a = ci * 0.25 - t;
        float ca = cos(a), sa = sin(a);
        p2 = p2 * mat2(ca, -sa, sa, ca);

        vec3 p = vec3(p2, position.z);

        vec4 mvPosition = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mvPosition;

        float psize = size * (200. / -mvPosition.z);
        gl_PointSize = psize * (1. + .5*sin(uTime*sCoef + position.x));
      }
    `,
      fragmentShader: `
      uniform sampler2D uTexture;
      varying vec4 vColor;
      varying float vRotation;
      void main() {
        vec2 v = gl_PointCoord - .5;
        float ca = cos(vRotation), sa = sin(vRotation);
        mat2 rmat = mat2(ca, -sa, sa, ca);
        gl_FragColor = vColor * texture2D(uTexture, v*rmat + .5);
      }
    `,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true });


    points = new THREE.Points(geometry, material);
    points.rotation.x = -0.5;
    scene.add(points);

    renderer.domElement.addEventListener('mouseup', e => {
      randomColors();
    });
  }

  function randomColors() {
    startTime = Date.now();
    const cscale = chroma.scale([chroma.random(), chroma.random(), chroma.random(), chroma.random()]);
    const colors = points.geometry.attributes.color.array;
    let j, color;
    for (let i = 0; i < numPoints; i++) {
      j = i * 3;
      color = cscale(rnd(0, 1));
      colors[j] = color.get('rgb.r') / 0xff;
      colors[j + 1] = color.get('rgb.g') / 0xff;
      colors[j + 2] = color.get('rgb.b') / 0xff;
    }
    points.geometry.attributes.color.needsUpdate = true;
  }

  function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() - startTime;
    points.material.uniforms.uTime.value = time;
    points.rotation.z += -mouse.x * 0.01;

    if (cameraCtrl) cameraCtrl.update();
    renderer.render(scene, camera);
  }

  function updateSize() {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

App();