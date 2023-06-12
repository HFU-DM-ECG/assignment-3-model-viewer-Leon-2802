import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'https://unpkg.com/three@0.120.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.120.1/examples/jsm/loaders/GLTFLoader.js';

// basic variables and components----------------------------------------------------------------
const sceneContainer = document.getElementById('scene-container');
const loader = new GLTFLoader();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
const renderer = new THREE.WebGLRenderer(
    { antialias: true, alpha: true, canvas: sceneContainer }
);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
//-----------------------------------------------------------------------------------------------

//load shaders
const celVertexShader = await fetch('./cel.vert').then(response => response.text());
const celFragmentShader = await fetch('./cel.frag').then(response => response.text());

//Lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);
const ambientLight = new THREE.AmbientLight(0xffffff, .2);
scene.add(ambientLight);

// shader-lights:
const light0 = {
    position: new THREE.Vector3(1, 0, 0),
    color: new THREE.Vector3(1, 1, 1),
    strength: .7
};
const light1 = {
    position: new THREE.Vector3(1, 2, 0),
    color: new THREE.Vector3(1, 1, 1),
    strength: .7
};
const light2 = {
    position: new THREE.Vector3(1, 0, 2),
    color: new THREE.Vector3(1, 1, 1),
    strength: .7
};
const light3 = {
    position: new THREE.Vector3(1, 4, 0),
    color: new THREE.Vector3(1, 1, 1),
    strength: .7
};
const light4 = {
    position: new THREE.Vector3(4, 0, 2),
    color: new THREE.Vector3(1, 1, 1),
    strength: .7
};
const light5 = {
    position: new THREE.Vector3(0, 3, 0),
    color: new THREE.Vector3(1, 1, 1),
    strength: .7
};
const light6 = {
    position: new THREE.Vector3(3, 0, 3),
    color: new THREE.Vector3(1, 1, 1),
    strength: .7
};
const light7 = {
    position: new THREE.Vector3(0, 0, 0),
    color: new THREE.Vector3(1, 1, 1),
    strength: .7
};

//load model
let can;
loader.load('Assets/claptrap.glb', function (glb) {
    can = glb.scene;
    const canObject = can.getObjectByName("Cube");
    canObject.scale.set(1 / 3, 1 / 3, 1 / 3);
    can.rotation.set(-90, 0, 0);

    const texture = new THREE.TextureLoader().load('Assets/banner.jpg');

    can.getObjectByName("Cube").material = new THREE.ShaderMaterial({
        vertexShader: celVertexShader,
        fragmentShader: celFragmentShader,
        uniforms: {
            texture1: { value: texture },
            lights: {
                value: [light0, light1, light2, light3, light4, light5, light6, light7]
            }
        },
    });

    scene.add(can);
});

//apply shader


//orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = false;
controls.enablePan = false;
controls.minDistance = 2;
controls.maxDistance = 15;
controls.maxPolarAngle = Math.PI;
controls.update()


// render scene
function renderScene() {
    scene;
    controls.update();
    requestAnimationFrame(renderScene);
    renderer.render(scene, camera);
};

renderScene();