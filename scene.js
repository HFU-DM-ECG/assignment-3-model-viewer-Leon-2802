import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/postprocessing/RenderPass.js';
import * as THREE from 'https://unpkg.com/three@0.120.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.120.1/examples/jsm/loaders/GLTFLoader.js';
import { CustomOutlinePass } from './CustomOutlinePass.js';

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

const params = {
    color: '#668f7d',
    strength: 0.25,
    detail: 0.99,
    brightness: 0.1,
    outlineColor: '#000000'
};


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, sizes.width / sizes.height, 0.1, 100);
const renderer = new THREE.WebGLRenderer(
    { antialias: true, alpha: true, canvas: sceneContainer }
);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
//-----------------------------------------------------------------------------------------------

// Set up post processing -----------------------------------------------------------------------
// Create a render target that holds a depthTexture so we can use it in the outline pass
// See: https://threejs.org/docs/index.html#api/en/renderers/WebGLRenderTarget.depthBuffer
const depthTexture = new THREE.DepthTexture();
const renderTarget = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    {
        depthTexture: depthTexture,
        depthBuffer: true,
    }
);

// Initial render pass.
const composer = new EffectComposer(renderer, renderTarget);
const pass = new RenderPass(scene, camera);
composer.addPass(pass);

// Outline pass.
const customOutline = new CustomOutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
);
composer.addPass(customOutline);
const outlineUniforms = customOutline.fsQuad.material.uniforms;
//-----------------------------------------------------------------------------------------------


//load shaders
const celVertexShader = await fetch('./shaders/cel.vert').then(response => response.text());
const celFragmentShader = await fetch('./shaders/cel.frag').then(response => response.text());


//Lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(0, -1, 10);
scene.add(directionalLight);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);



// set up model for model viewer---------------------------------------------
let robot;

// set up toon shader
const toonShader = new THREE.ShaderMaterial({
    lights: true,
    vertexShader: celVertexShader,
    fragmentShader: celFragmentShader,
    uniforms: {
        ...THREE.UniformsLib.lights,
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


// GUI for setting shader parameters--------------------------------------
const gui = new dat.GUI();

// helper functions
function hexToRGB(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
function rgbToVec3(rgb) {
    return new THREE.Vector3((rgb.r / 255), (rgb.g / 255), (rgb.b / 255));
}

gui.addColor(params, 'color').onChange(function (value) {
    toonShader.uniforms.color.value = rgbToVec3(hexToRGB(value));
});
gui.add(params, 'strength', 0, 1).step(0.01).onChange(function (value) {
    toonShader.uniforms.strength.value = value;
});
gui.add(params, 'detail', 0, 1).step(0.01).onChange(function (value) {
    toonShader.uniforms.detail.value = value;
});
gui.add(params, 'brightness', 0, 1).step(0.01).onChange(function (value) {
    toonShader.uniforms.brightness.value = value;
});
gui.addColor(params, 'outlineColor').onChange(function (value) {
    outlineUniforms.outlineColor.value.set(value);
});
// ------------------------------------------------------------------


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    customOutline.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize, false);


// render scene
function renderScene() {
    scene;
    requestAnimationFrame(renderScene);
    renderer.render(scene, camera);
    composer.render();
};

renderScene();