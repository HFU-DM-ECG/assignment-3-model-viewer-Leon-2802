import * as THREE from 'https://unpkg.com/three@0.120.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.120.1/examples/jsm/loaders/GLTFLoader.js';

// basic variables and components----------------------------------------------------------------
const sceneContainer = document.getElementById('scene-container');
const loader = new GLTFLoader();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const robotPos = {
    x: 0,
    y: -.7,
    z: -3
};


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, sizes.width / sizes.height, 0.1, 100);
const renderer = new THREE.WebGLRenderer(
    { antialias: true, alpha: true, canvas: sceneContainer }
);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap
//-----------------------------------------------------------------------------------------------

//load shaders
const celVertexShader = await fetch('./cel.vert').then(response => response.text());
const celFragmentShader = await fetch('./cel.frag').then(response => response.text());
const outlineVertShader = await fetch('./shaders/outline.vert').then(response => response.text());
const outlineFragShader = await fetch('./shaders/outline.frag').then(response => response.text());

//Lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(0, -1, 10);
// shadow casting
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 4096; // increases the shadow mapSize so the shadows are sharper
directionalLight.shadow.mapSize.height = 4096;
scene.add(directionalLight);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);
// for calculating shading effects:
let lightDirection = directionalLight.position;



// set up model for model viewer---------------------------------------------
let robot;
let robotOutline

// set up toon shader
const toonShader = new THREE.ShaderMaterial({
    lights: true,
    vertexShader: celVertexShader,
    fragmentShader: celFragmentShader,
    uniforms: {
        ...THREE.UniformsLib.lights,
        lightDirection: { value: lightDirection },
        strength: { value: 0.25 },
        detail: { value: 0.99 },
        color: { value: new THREE.Vector3(.4, .56, .49) },
        brightness: { value: 0.1 }
    },
});

//load model
loader.load('Assets/claptrap.glb', function (glb) {
    robot = glb.scene;
    const robotObject = robot.getObjectByName("Cube");
    robotObject.scale.set(1 / 3, 1 / 3, 1 / 3);
    robot.rotation.set(0, 0, 0);
    robot.position.set(robotPos.x, robotPos.y, robotPos.z);

    // const testMaterial = new THREE.MeshPhysicalMaterial();
    // robot.getObjectByName("Cube").material = testMaterial;
    // robot.getObjectByName("antenne").material = testMaterial;
    // robot.getObjectByName("arms").material = testMaterial;

    robot.getObjectByName("Cube").material = toonShader;
    robot.getObjectByName("antenne").material = toonShader;
    robot.getObjectByName("arms").material = toonShader;

    scene.add(robot);
});


// set up outline shader
const outlineShader = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    vertexShader: outlineVertShader,
    fragmentShader: outlineFragShader,
    uniforms: {
        color: { value: new THREE.Vector3(0, 0, 0) },
    },
});

//outline effect 
loader.load('Assets/claptrap.glb', function (glb) {
    robotOutline = glb.scene;
    const robotObject = robotOutline.getObjectByName("Cube");
    robotObject.scale.set(1 / 2.9, 1 / 2.9, 1 / 2.9);
    robotOutline.rotation.set(0, 0, 0);
    robotOutline.position.set(robotPos.x, robotPos.y, robotPos.z);

    robotOutline.getObjectByName("Cube").material = outlineShader;
    robotOutline.getObjectByName("antenne").material = outlineShader;
    robotOutline.getObjectByName("arms").material = outlineShader;

    scene.add(robotOutline);
});

//add cube-stand
const cubeGeometry = new THREE.BoxGeometry(2, 1.4, 1.4);
const cubeMaterial = toonShader.clone();
cubeMaterial.uniforms.color.value = new THREE.Vector3(.4, 0, 0);
const cubeStand = new THREE.Mesh(cubeGeometry, cubeMaterial);
cubeStand.position.set(0, -2, -3);
scene.add(cubeStand);
// --------------------------------------------------------------------------



// move robot through mouse input ---------------------------
let mouseX;
let leftMouseDown = false;

sceneContainer.addEventListener('mousemove', (event) => {
    if (!leftMouseDown) {
        return;
    }
    event.preventDefault();

    var rotX = event.clientX - mouseX;
    mouseX = event.clientX;

    robot.rotation.y += rotX / 100;
    robotOutline.rotation.y += rotX / 100;
    // cubeStand.rotation.y += rotX / 100;
});

sceneContainer.addEventListener('mousedown', (event) => {
    event.preventDefault();
    leftMouseDown = true;
    mouseX = event.clientX;
});
sceneContainer.addEventListener('mouseup', (event) => {
    event.preventDefault();
    leftMouseDown = false;
    mouseX = event.clientX;
});
//-----------------------------------------------------------


// render scene
function renderScene() {
    scene;
    lightDirection = directionalLight.position;
    toonShader.uniforms.lightDirection.value = lightDirection;
    requestAnimationFrame(renderScene);
    renderer.render(scene, camera);
};

renderScene();