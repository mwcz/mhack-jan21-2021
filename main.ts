import {
    PerspectiveCamera,
    Color,
    sRGBEncoding,
    PMREMGenerator,
    ACESFilmicToneMapping,
    MeshPhongMaterial,
    MeshPhysicalMaterial,
    Scene,
    WebGLRenderer,
    Group,
    Mesh,
    Material
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment";
import { TTFLoader } from "three/examples/jsm/loaders/TTFLoader";
import { Font } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

import * as themeSwitcher from "./minimal-theme-switcher";

window.Color = Color;
let camera    : PerspectiveCamera;
let scene     : Scene;
let renderer  : WebGLRenderer;
let controls  : OrbitControls;
let floppy    : Group;
let textMesh : Mesh;
let textMat   : MeshPhysicalMaterial;
let textGeo   : TextGeometry;
let font      : Font;

const WIDTH = 300;
const HEIGHT = 300;

init();
animate();

// function easeInOutQuart(x: number): number {
//     return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
// }
function easeOutQuint(x: number): number {
    return 1 - Math.pow(1 - x, 5);
}
// function easeInOutQuartDouble(x: number): number {
//     return x < 0.5 ? easeOutQuint(x*2) : easeInOutQuart(1-2*(x-0.5));
// }

// // draw the easing curve
// for(let i = 0; i <= 1;  i += 0.01) {
//     let len = easeInOutQuartDouble(i);
//     // console.log(len);
//     console.log(
//         new Array(
//             +((len*120)).toFixed(0)
//         ).fill("#").join("")
//     );
// }

function createText(floppy: Group, text: string, color: Color) {
    textGeo = new TextGeometry(text, {
        font,
        size: 1,
        height: 0.07,
        curveSegments: 20,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelEnabled: true,
    });

    textGeo.computeBoundingBox();
    textGeo.computeVertexNormals();

    const centerOffset = 0.5*(textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
    const vertOffset = 2.5*(textGeo.boundingBox.max.y - textGeo.boundingBox.min.y );

    textMesh = new Mesh(textGeo, textMat);

    floppy.getObjectByName("RootNode_(model_correction_matrix)").add(textMesh);

    textMesh.position.x = centerOffset;
    textMesh.position.y = vertOffset;
    textMesh.rotation.x = Math.PI*2;
    textMesh.rotation.y = 0;
    textMesh.rotation.z = Math.PI;

    if (color) {
        textMat.color.set(color);
    }

    window.textMesh1 = textMesh;

}

function init() {

    const container = document.querySelector( 'button' );

    camera = new PerspectiveCamera( 24, 1, 0.1, 200 );
    camera.position.set( - 0.75, 0.7, 400.25 );

    window.camera = camera;

    scene = new Scene();


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

            // font

            // textMat = new MeshPhongMaterial( { color: 0xc16010, flatShading: true } );
            textMat = new MeshPhysicalMaterial({
                color: new Color().setHSL(0.50,0.88,0.35),
                roughness: 1.5,
                metalness: 0.1,
                reflectivity: 0,
                clearcoat: 0.15,
                clearcoatRoughness: 0.2,
            });

            new TTFLoader().setPath("./font/").load("kenpixel.ttf", json => {
                font = new Font(json);
                createText(floppy, "SAVE");
            });

    });

    renderer = new WebGLRenderer( { antialias: true, alpha: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( WIDTH, HEIGHT);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = sRGBEncoding;
    renderer.setClearColor(0, 0);
    container.appendChild( renderer.domElement );

    const environment = new RoomEnvironment();
    environment.scale.setScalar(1.2);
    window.environment = environment;
    const pmremGenerator = new PMREMGenerator( renderer );

    scene.environment = pmremGenerator.fromScene( environment ).texture;

    controls = new OrbitControls( camera, renderer.domElement );
    controls.minDistance = 1;
    controls.maxDistance = 10;

    window.addEventListener( 'resize', onWindowResize );

    themeSwitcher.init();
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
let saveSpinTextChanged = false;

function clickHandler() {
    console.log("click");
    startSaveAnim();
}

function startSaveAnim() {
    saveSpinActive = true;
    saveSpinAnimStart = performance.now();
}

function setSavedText() {
    textMesh.parent.remove(textMesh);
    createText(floppy, "SAVED", new Color().setHSL(0.01,0.98,0.45));
}

document.querySelector("input[type=text]").addEventListener("keydown", setSaveText);

function setSaveText() {
    textMesh.parent.remove(textMesh);
    createText(floppy, "SAVE", new Color().setHSL(0.50,0.88,0.35));
}

function endSaveAnim() {
    saveSpinActive = false;
    saveSpinTextChanged = false;
}

document.querySelector("button").addEventListener("click", clickHandler);

function animate() {
    if (saveSpinActive) {
        let t = performance.now() - saveSpinAnimStart;
        let ts = t/saveSpinDuration;
        saveDiskRotation = easeOutQuint(ts%1) * (Math.PI*4);
        if ( !saveSpinTextChanged && t > saveSpinDuration / 2 - 500) {
            setSavedText();
            saveSpinTextChanged = true;
        }
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

    renderer.render( scene, camera );

}
