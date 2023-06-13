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
const camera = new THREE.PerspectiveCamera(90, sizes.width / sizes.height, 0.1, 100);
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
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(0, 0, 10);
scene.add(directionalLight);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
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
let robot;
const texture = new THREE.TextureLoader().load('Assets/banner.jpg');
loader.load('Assets/claptrap.glb', function (glb) {
    robot = glb.scene;
    const robotObject = robot.getObjectByName("Cube");
    robotObject.scale.set(1 / 3, 1 / 3, 1 / 3);
    robot.rotation.set(0, 0, 0);
    robot.position.set(0, .5, -3);

    robot.getObjectByName("Cube").material = new THREE.ShaderMaterial({
        vertexShader: celVertexShader,
        fragmentShader: celFragmentShader,
        uniforms: {
            texture1: { value: texture },
            lights: {
                value: [light0, light1, light2, light3, light4, light5, light6, light7]
            }
        },
    });

    scene.add(robot);
});

//add sphere-stand
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sphereMaterial = new THREE.ShaderMaterial({
    vertexShader: celVertexShader,
    fragmentShader: celFragmentShader,
    uniforms: {
        texture1: { value: null },
        lights: {
            value: [light0, light1, light2, light3, light4, light5, light6, light7]
        }
    },
});
// const sphereMaterial = new THREE.MeshPhysicalMaterial();
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(0, -.9, -3);
scene.add(sphere);

//apply shader


// move rings through mouse input ---------------------------
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


// render scene
function renderScene() {
    scene;
    requestAnimationFrame(renderScene);
    renderer.render(scene, camera);
};

renderScene();