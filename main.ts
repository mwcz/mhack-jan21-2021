import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment";

let camera   : THREE.PerspectiveCamera;
let scene    : THREE.Scene;
let renderer : THREE.WebGLRenderer;
let controls : OrbitControls;
let floppy   : THREE.Group;

const WIDTH = 300;
const HEIGHT = 300;

init();
animate();

function easeInOutQuart(x: number): number {
    return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
}
function easeOutQuint(x: number): number {
    return 1 - Math.pow(1 - x, 5);
}
function easeInOutQuartDouble(x: number): number {
    return x < 0.5 ? easeOutQuint(x*2) : easeInOutQuart(1-2*(x-0.5));
}

// draw the easing curve
for(let i = 0; i <= 1;  i += 0.01) {
    let len = easeInOutQuartDouble(i);
    // console.log(len);
    console.log(
        new Array(
            +((len*120)).toFixed(0)
        ).fill("#").join("")
    );
}

function init() {

    const container = document.querySelector( 'button' );

    camera = new THREE.PerspectiveCamera( 24, 1, 0.1, 200 );
    camera.position.set( - 0.75, 0.7, 400.25 );

    window.camera = camera;

    scene = new THREE.Scene();

    // model

    new GLTFLoader()
    .setPath( './floppy_disk/' )
    .load( 'scene.gltf', function ( gltf ) {

        scene.add( gltf.scene );

        floppy = gltf.scene;

        floppy.position.z = -14;
        floppy.rotation.z += Math.PI; // flip to vertical
        // floppy.rotation.y -= Math.PI/8; // face the camera

        // get the mesh and make the metalness less mirrory
        floppy.getObjectByName("FloppyDisk_FloppyDisk_0").material.metalness = 0.5;

        window.floppy = floppy; // for manual tweaking


    } );

    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( WIDTH, HEIGHT);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setClearColor(0, 0);
    container.appendChild( renderer.domElement );

    const environment = new RoomEnvironment();
    environment.scale.setScalar(1.2);
    window.environment = environment;
    const pmremGenerator = new THREE.PMREMGenerator( renderer );

    // scene.background = new THREE.Color( 0x0 );
    scene.environment = pmremGenerator.fromScene( environment ).texture;

    controls = new OrbitControls( camera, renderer.domElement );
    // controls.enableDamping = false;
    controls.minDistance = 1;
    controls.maxDistance = 10;
    // controls.target.set( 0, 0.35, 0 );
    // controls.update();

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = 1;
    camera.updateProjectionMatrix();

    renderer.setSize( WIDTH, HEIGHT );

}


//
let saveDiskRotation = 0;
let saveSpinAnimStart = 0;
let saveSpinActive = false;
let saveSpinDuration = 3000;

function clickHandler() {
    console.log("click");
    startSaveAnim();
}

function startSaveAnim() {
    saveSpinActive = true;
    saveSpinAnimStart = performance.now();
}

function endSaveAnim() {
    saveSpinActive = false;
}

function hoverHandler() {
    console.log("hover");
}

document.querySelector("button").addEventListener("click", clickHandler);
document.querySelector("button").addEventListener("mouseover", hoverHandler);

function animate() {
    if (saveSpinActive) {
        let t = performance.now() - saveSpinAnimStart;
        let ts = t/saveSpinDuration;
        saveDiskRotation = easeOutQuint(ts%1) * (Math.PI*4);
        if (t > saveSpinDuration) {
            endSaveAnim();
        }
    }

    requestAnimationFrame( animate );

    controls.update();

    render();

}


function render() {

    if (floppy && saveSpinActive) {
        // floppy.getObjectByName("RootNode_(model_correction_matrix)").rotateY(rotationSpeed);
        floppy.getObjectByName("RootNode_(model_correction_matrix)").rotation.y = saveDiskRotation;
    }

    // floppy.children[0].translateZ

    renderer.render( scene, camera );

}
