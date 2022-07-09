
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader'
import {PLYLoader} from 'three/examples/jsm/loaders/PLYLoader'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { VertexNormalsHelper } from './jsm/helpers/VertexNormalsHelper.js';
import {GUI} from 'lil-gui'
import { DoubleSide, MeshStandardMaterial, Object3D } from 'three'
import * as CANNON from 'cannon-es'



var clock = new THREE.Clock();

let scene = new THREE.Scene();
scene.background = new THREE.Color(0xdddddd);

let renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;

function makeCamera(fov = 40) {
    const aspect = 2;  // the canvas default
    const zNear = 1;
    const zFar = 5000;
    return new THREE.PerspectiveCamera(fov, aspect, zNear, zFar);
}

let topcamera = new THREE.PerspectiveCamera(40,window.innerWidth/window.innerHeight,1,5000);
topcamera.rotation.y = 45/180*Math.PI;
topcamera.position.x = 0;
topcamera.position.y = 160;
topcamera.position.z = 400;

let controls = new OrbitControls(topcamera, renderer.domElement);

const textureLoader = new THREE.TextureLoader();





// ADDING MODELS TO THE SCENE
var objects = []
let loader = new GLTFLoader();


// Adding football to the scene
var footballGeometry = new THREE.SphereGeometry(2, 32);
var footballBaseColor = textureLoader.load('./ballTexture/football-diffuse-512.png');
var footballNormal = textureLoader.load('./ballTexture/football-normals-512.png');

var footballMaterial = new THREE.MeshStandardMaterial( {
    side:THREE.DoubleSide,
    map: footballBaseColor,
    normalMap: footballNormal
} );

const footbally = 2;
var football = new THREE.Mesh( footballGeometry, footballMaterial);
objects.push(football);
scene.add(football);
football.castShadow = true;
var loadres = await isLoaded;
football.position.y = footbally;
objects.push(football);




// Adding the field 
// Adding the ground
var ground;
var groundGeometry = new THREE.PlaneGeometry(800, 1200);
var groundBaseColor = textureLoader.load('./Grass_001_SD/Grass_001_COLOR.jpg');
groundBaseColor.wrapS = THREE.RepeatWrapping;
groundBaseColor.wrapT = THREE.RepeatWrapping;
groundBaseColor.repeat.set( 50, 50 );

var groundDisplacement = textureLoader.load('./Grass_001_SD/Grass_001_DISP.png');
groundDisplacement.wrapS = THREE.RepeatWrapping;
groundDisplacement.wrapT = THREE.RepeatWrapping;
groundDisplacement.repeat.set( 50, 50 );

var groundNormal = textureLoader.load('./Grass_001_SD/Grass_001_NORM.jpg');
groundNormal.wrapS = THREE.RepeatWrapping;
groundNormal.wrapT = THREE.RepeatWrapping;
groundNormal.repeat.set( 50, 50 );

var groundRoughness = textureLoader.load('./Grass_001_SD/Grass_001_ROUGH.jpg');
groundRoughness.wrapS = THREE.RepeatWrapping;
groundRoughness.wrapT = THREE.RepeatWrapping;
groundRoughness.repeat.set( 50, 50 );

var groundMaterial = new THREE.MeshStandardMaterial({
    color:0x007700, side:THREE.DoubleSide,
    map: groundBaseColor,
    normalMap: groundNormal,
    roughnessMap: groundRoughness,
    displacementMap: groundDisplacement,
    roughness:6
});

ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.receiveShadow = true;
ground.rotation.x = Math.PI/2;




// Add obstacles to the scene
var staticBoxes = [];
var marbleBaseColor = textureLoader.load('./marbleTexture/Marble_Blue_004_basecolor.jpg');
var marbleRoughness = textureLoader.load('./marbleTexture/Marble_Blue_004_roughness.jpg');
let marbleMaterial = new MeshStandardMaterial({
    map: marbleBaseColor,
    roughnessMap: marbleRoughness,
    side: THREE.DoubleSide
});


const plyloader = new PLYLoader();
let teapotGeometry;
let teapotLoaded = new Promise(function(resolve, reject) {
    plyloader.load( './teapot.ply', function ( geometry ) {
        geometry.computeVertexNormals();
        teapotGeometry = geometry;
        resolve("Teapot geometry set");
    });
});
let res = await teapotLoaded;
let teapotMesh1 = new THREE.Mesh(teapotGeometry, marbleMaterial);
scene.add(teapotMesh1);
teapotMesh1.castShadow = true;
teapotMesh1.scale.set(30, 30, 30);
teapotMesh1.rotation.x -= Math.PI / 2;

teapotMesh1.position.set(-123, 0, 232);
staticBoxes.push(new THREE.Box3().setFromObject(teapotMesh1));



let boxGeometry = new THREE.BoxGeometry(50, 50, 50);
let teapotMesh2 = new THREE.Mesh(boxGeometry, marbleMaterial);
scene.add(teapotMesh2);
teapotMesh2.castShadow = true;
teapotMesh2.position.set(-110, 25, -134);
staticBoxes.push(new THREE.Box3().setFromObject(teapotMesh2));



let sphereGeometry = new THREE.SphereGeometry(30, 20, 20);
let sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x123456,
    wireframe: true
});
let sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphereMesh);
sphereMesh.castShadow = true;
sphereMesh.position.set(250, 30, -200);
staticBoxes.push(new THREE.Box3().setFromObject(sphereMesh));



let boxMesh2 = new THREE.Mesh(boxGeometry, marbleMaterial);
boxMesh2.position.set(210, 25, 334);
scene.add(boxMesh2);
boxMesh2.castShadow = true;
staticBoxes.push(new THREE.Box3().setFromObject(boxMesh2));


const coneGeometry = new THREE.ConeGeometry( 20, 50, 50 );
const coneMesh = new THREE.Mesh( coneGeometry, marbleMaterial );
coneMesh.position.set(-200, 25, -400);
scene.add(coneMesh);
coneMesh.castShadow = true;
staticBoxes.push(new THREE.Box3().setFromObject(coneMesh));

var sideGeometry = new THREE.BoxGeometry(0.1, 400, 1200);
var sideMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true
});

const boxMesh3 = new THREE.Mesh(boxGeometry, marbleMaterial);
boxMesh3.position.set(200, 25, -300);
scene.add(boxMesh3);
staticBoxes.push(new THREE.Box3().setFromObject(boxMesh3));
boxMesh3.castShadow = true;

// const leftMesh = new THREE.Mesh(sideGeometry, marbleMaterial);
// leftMesh.position.x += 400;
// leftMesh.position.y += 200;

// const rightMesh = new THREE.Mesh(sideGeometry, marbleMaterial);
// rightMesh.position.x -= 400;
// rightMesh.position.y += 200;

// // the box behind the 2 goals.
// var goalsGeometry = new THREE.BoxGeometry(800, 400, 0.1);
// var goalsMaterial = new THREE.MeshBasicMaterial({
//     color: 0x0000ff,
//     wireframe: true
// });
// const frontMesh = new THREE.Mesh(goalsGeometry, goalsMaterial);
// frontMesh.position.z -= 600;
// frontMesh.position.y += 200;

// const backMesh = new THREE.Mesh(goalsGeometry, goalsMaterial);
// backMesh.position.z += 600;
// backMesh.position.y += 200;

// scene.add(rightMesh);
// scene.add(leftMesh);
// scene.add(frontMesh);
// scene.add(backMesh);

// staticBoxes.push(new THREE.Box3().setFromObject(rightMesh));
// staticBoxes.push(new THREE.Box3().setFromObject(leftMesh));
// staticBoxes.push(new THREE.Box3().setFromObject(frontMesh));
// staticBoxes.push(new THREE.Box3().setFromObject(backMesh));


// Adding the goalposts
var goalPost2, goalPost1;
var isLoaded = new Promise(function(resolve, reject) {
    loader.load('./goalpost/scene.gltf', function(gltf){
        goalPost2 = gltf.scene.children[0];
        goalPost2.scale.set(0.2,0.2,0.2);
        var box = new THREE.Box3();
        box.setFromObject(goalPost2);
        box.getCenter(goalPost2.position);
        goalPost2.position.set(
            -goalPost2.position.x,
            0,
            -goalPost2.position.z
        );
        goalPost1 = goalPost2.clone();
        goalPost1.rotateOnWorldAxis(
            new THREE.Vector3(0,1,0),
            Math.PI
        )

        goalPost1.position.set(
            -goalPost1.position.x,
            0,
            -goalPost1.position.z
        );
        
        goalPost2.position.z += 550;
        goalPost1.position.z -= 550;
        resolve("Field loaded")
    });
});



var loadres = await isLoaded;
var field = new THREE.Object3D();
field.add(ground);
objects.push(ground);
field.add(goalPost2);
objects.push(goalPost2);
field.add(goalPost1);
objects.push(goalPost1);

scene.add(field);
objects.push(field);





// ADDING STADIUM LIGHTS
var box = new THREE.Box3();
box.setFromObject(ground);


let l1 = new THREE.PointLight(0xffffff,0.4);
l1.position.set(box.min.x,300,box.min.z);
field.add(l1);
l1.castShadow = true;
objects.push(l1);


let l2 = new THREE.PointLight(0xffffff,0.4);
l2.position.set(box.min.x,300,box.max.z);
field.add(l2);
l2.castShadow = true;
objects.push(l2);


let l3 = new THREE.PointLight(0xffffff,0.4);
l3.position.set(box.max.x,300,box.min.z);
field.add(l3);
l3.castShadow = true;
objects.push(l3);


let l4 = new THREE.PointLight(0xffffff,0.4);
l4.position.set(box.max.x,300,box.max.z);
field.add(l4);
l4.castShadow = true;
objects.push(l4);


let stadlights = [l1, l2, l3, l4];
stadlights.forEach(function(light) {
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.camera.near = 10;
    light.shadow.camera.far = 2000;
    light.shadow.focus = 1;
    light.shadow.radius = 2;
    light.decay = 5
});


var light1, light2, light3, light4;
var isLoaded = new Promise(function(resolve, reject) {
    loader.load('./light/scene.gltf', function(gltf){
        light1 = gltf.scene.children[0];
        light1.scale.set(0.1,0.1,0.1);
        light1.children[0].children[0].children[22].visible = false;
        light2 = light1.clone();
        light3 = light1.clone();
        light4 = light1.clone();

        light1.rotateOnWorldAxis(
            new THREE.Vector3(0,1,0),
            -Math.PI/4
        )
        light1.position.set(
            l1.position.x,
            5,
            l1.position.z
        );

        light2.rotateOnWorldAxis(
            new THREE.Vector3(0,1,0),
            Math.PI/4
        )
        light2.position.set(
            l2.position.x,
            5,
            l2.position.z
        );

        light3.rotateOnWorldAxis(
            new THREE.Vector3(0,1,0),
            -3*Math.PI/4
        )
        light3.position.set(
            l3.position.x,
            5,
            l3.position.z
        );

        light4.rotateOnWorldAxis(
            new THREE.Vector3(0,1,0),
            3*Math.PI/4
        )
        light4.position.set(
            l4.position.x,
            5,
            l4.position.z
        );

        resolve("Field loaded")
    });
});

var loadres = await isLoaded;

field.add(light1);
objects.push(light1);
field.add(light2);
objects.push(light2);
field.add(light3);
objects.push(light3);
field.add(light4);
objects.push(light4);

let gui = new GUI();
gui.add(l1, 'visible').name("Light 1");
gui.add(l2, 'visible').name("Light 2");
gui.add(l3, 'visible').name("Light 3");
gui.add(l4, 'visible').name("Light 4");


let ballSpotLight = new THREE.SpotLight(0x000055, 50);
{
    ballSpotLight.position.set(0, 200, 0);
    ballSpotLight.target = football;
    ballSpotLight.angle = Math.PI / 10;
    ballSpotLight.penumbra = 1;
    ballSpotLight.decay = 0;
    ballSpotLight.distance = 400;

    ballSpotLight.castShadow = true;
    ballSpotLight.shadow.mapSize.width = 512;
    ballSpotLight.shadow.mapSize.height = 512;
    ballSpotLight.shadow.camera.near = 10;
    ballSpotLight.shadow.camera.far = 400;
    ballSpotLight.shadow.focus = 3;

    field.add(ballSpotLight);
    gui.add(ballSpotLight, 'visible').name("Ball Light");
}








// ADDING PLAYER 1 OBJECT
var cylinderGeometry = new THREE.CylinderGeometry( 8, 8, 15, 32 );
var player1BaseColor = textureLoader.load('./player1Map/Sci_fi_Metal_Panel_004_basecolor.jpg');
var player1Emissive = textureLoader.load('./player1Map/Sci_fi_Metal_Panel_004_emissive.jpg');
var player1Metal = textureLoader.load('./player1Map/Sci_fi_Metal_Panel_004_metallic.jpg');
var player1Normal = textureLoader.load('./player1Map/Sci_fi_Metal_Panel_004_normal.jpg');
var player1Roughness = textureLoader.load('./player1Map/Sci_fi_Metal_Panel_004_roughness.jpg');


var cylinderMaterial = new THREE.MeshStandardMaterial( {
    side:THREE.DoubleSide,
    map: player1BaseColor,
    normalMap: player1Normal,
    roughnessMap: player1Roughness,
    metalnessMap: player1Metal,
    emissiveMap: player1Emissive,
    roughness: 10
} );



var player1 = new THREE.Mesh( cylinderGeometry, cylinderMaterial);
player1.position.y = 20;
player1.position.z = 100;
objects.push(player1);
scene.add(player1);
player1.castShadow = true;

// ADDING LIGHT TO PLAYER
let player1SpotLight = new THREE.SpotLight(0xffffff, 1);
{
    player1SpotLight.position.set(0, 150, 150);
    player1SpotLight.target = player1;
    player1SpotLight.angle = Math.PI / 8;
    player1SpotLight.penumbra = 1;
    player1SpotLight.decay = 0.5;
    player1SpotLight.distance = 400;

    player1SpotLight.castShadow = true;
    player1SpotLight.shadow.mapSize.width = 512;
    player1SpotLight.shadow.mapSize.height = 512;
    player1SpotLight.shadow.camera.near = 10;
    player1SpotLight.shadow.camera.far = 400;
    player1SpotLight.shadow.focus = 1;

    player1.add(player1SpotLight);
    gui.add(player1SpotLight, 'visible').name("Player 1 Light");
}


// ADDING CAMERAS TO PLAYER  
const player1fpsCameraFOV = 45;
const player1fpsCamera = makeCamera(player1fpsCameraFOV);
player1fpsCamera.position.y = 8;
player1fpsCamera.position.z = 0;
player1.add(player1fpsCamera);

player1fpsCamera.rotateOnWorldAxis(
    new THREE.Vector3(1,0,0),
    -0.35
); 

const player1tpsCameraFOV = 55;
const player1tpsCamera = makeCamera(player1tpsCameraFOV);
player1tpsCamera.position.y = 25;
player1tpsCamera.position.z = 95;
player1.add(player1tpsCamera);

player1tpsCamera.lookAt(player1);
let controlsPlayer1 = new OrbitControls(player1tpsCamera, renderer.domElement);
controlsPlayer1.enableZoom = false;
controlsPlayer1.enablePan = false;

var camera = topcamera;









// ADDING PLAYER 2 OBJECT
var cylinderGeometry = new THREE.CylinderGeometry( 8, 8, 15, 32 );
var player2BaseColor = textureLoader.load('./player2Map/Sci_fi_Metal_Panel_004_basecolor.jpg');
var player2Emissive = textureLoader.load('./player2Map/Sci_fi_Metal_Panel_004_emissive.jpg');
var player2Metal = textureLoader.load('./player2Map/Sci_fi_Metal_Panel_004_metallic.jpg');
var player2Normal = textureLoader.load('./player2Map/Sci_fi_Metal_Panel_004_normal.jpg');
var player2Roughness = textureLoader.load('./player2Map/Sci_fi_Metal_Panel_004_roughness.jpg');


var cylinderMaterial = new THREE.MeshStandardMaterial( {
    side:THREE.DoubleSide,
    map: player2BaseColor,
    normalMap: player2Normal,
    roughnessMap: player2Roughness,
    metalnessMap: player2Metal,
    emissiveMap: player2Emissive,
    roughness: 10
} );



var player2 = new THREE.Mesh( cylinderGeometry, cylinderMaterial);
player2.position.y = 20;
player2.position.z = -100;
objects.push(player2);
scene.add(player2);
player2.castShadow = true;

player2.rotateOnWorldAxis(
    new THREE.Vector3(0,1,0),
    Math.PI
);

// ADDING LIGHT TO PLAYER
let player2SpotLight = new THREE.SpotLight(0xffffff, 1);
{
    player2SpotLight.position.set(0, 150, 150);
    player2SpotLight.target = player2;
    player2SpotLight.angle = Math.PI / 8;
    player2SpotLight.penumbra = 1;
    player2SpotLight.decay = 0.5;
    player2SpotLight.distance = 400;

    player2SpotLight.castShadow = true;
    player2SpotLight.shadow.mapSize.width = 512;
    player2SpotLight.shadow.mapSize.height = 512;
    player2SpotLight.shadow.camera.near = 10;
    player2SpotLight.shadow.camera.far = 400;
    player2SpotLight.shadow.focus = 1;

    player2.add(player2SpotLight);
    gui.add(player2SpotLight, 'visible').name("Player 2 Light");
}


// ADDING CAMERAS TO PLAYER  
const player2fpsCameraFOV = 45;
const player2fpsCamera = makeCamera(player2fpsCameraFOV);
player2fpsCamera.position.y = 8;
player2fpsCamera.position.z = 0;
player2.add(player2fpsCamera);

player2fpsCamera.rotateOnWorldAxis(
    new THREE.Vector3(1,0,0),
    -0.35
); 

const player2tpsCameraFOV = 55;
const player2tpsCamera = makeCamera(player2tpsCameraFOV);
player2tpsCamera.position.y = 25;
player2tpsCamera.position.z = 95;
player2.add(player2tpsCamera);

player2tpsCamera.lookAt(player2);
let controlsPlayer2 = new OrbitControls(player2tpsCamera, renderer.domElement);
controlsPlayer2.enableZoom = false;
controlsPlayer2.enablePan = false;

var camera = topcamera;









// PLAYER AND BALL MOVEMENT 
const FREEMOVE = 0;
const CARRY = 1;
const DRIBBLE = 2;
const restitution = 0.8;
const cspeed = 2;
const mspeed = 150;
const kspeed = 0.6;
const kvAtten = 0.8;
const dragAtten = 0.9999;
const dAtten = 0.95;
const gravity = -9.81;

// Adding helpers and bounding boxes
let ballHelper = new THREE.Object3D();
let player1Helper = new THREE.Object3D();
let player2Helper = new THREE.Object3D();
objects.push(ballHelper);
objects.push(player1Helper);
objects.push(player2Helper);
scene.add(ballHelper);
scene.add(player1Helper);
scene.add(player2Helper);

// Getting bounding box for player1
let boxPl1 = new THREE.Box3();
boxPl1.setFromObject(player1);
boxPl1.expandByVector(new THREE.Vector3(2,17,2));
let helper1 = new THREE.Box3Helper(boxPl1, 0xffff00);
player1Helper.add(helper1);

// Getting bounding box for player2
let boxPl2 = new THREE.Box3();
boxPl2.setFromObject(player2);
boxPl2.expandByVector(new THREE.Vector3(2,17,2));
let helper2 = new THREE.Box3Helper(boxPl2, 0xffff00);
player2Helper.add(helper2);

// Get the bounding box for the football
let boxF = new THREE.Box3();
boxF.setFromObject(football);
let helper3 = new THREE.Box3Helper(boxF, 0xffff00);
ballHelper.add(helper3);

// Getting bounding box for ground
let groundBox = new THREE.Box3();
groundBox.setFromObject(ground);

gui.add(player1Helper, 'visible').name("Player 1 Helper");
gui.add(player2Helper, 'visible').name("Player 2 Helper");
gui.add(ballHelper, 'visible').name("Ball Helper");
ballHelper.visible = false;





var state = {
    mode : FREEMOVE, 
    ballSpeed : new THREE.Vector3(0,0,0), 
    carrying:false, 
    dribbling:false, 
    dribbleDirection: new THREE.Vector3(0,0,0),
    dribbleState:0,
    kickGoing:false,
    kickTime:0,
    currentPlayer:player1,
    currentbbox:boxPl1,
    currentHelper:player1Helper,
    currentfps:player1fpsCamera,
    currenttps:player1tpsCamera,
    currentGoalPost:goalPost1
};





function updateboxPl() {
    state.currentHelper.clear();
    state.currentbbox = new THREE.Box3();
    state.currentbbox.setFromObject(state.currentPlayer);
    state.currentbbox.expandByVector(new THREE.Vector3(2,17,2));
    state.currentHelper.add(new THREE.Box3Helper(state.currentbbox, 0xffff00));

    if(state.currentPlayer == player1) {
        boxPl1 = state.currentbbox;
    }
    else {
        boxPl2 = state.currentbbox;
    }
}

function updateboxF() {
    ballHelper.clear();
    boxF = new THREE.Box3();
    boxF.setFromObject(football);
    ballHelper.add(new THREE.Box3Helper(boxF, 0xffff00));
}

function carry() {
    if(!state.carrying && state.currentbbox.intersectsBox(boxF)) {
        scene.remove(football);
        state.currentPlayer.add(football);
        football.position.set(
            0,
            -10,
            0,
        );
        state.carrying = true;
    }
    updateboxF();
}

function drop() {
    if((state.carrying || state.dribbling) && state.currentbbox.intersectsBox(boxF)) {
        state.currentPlayer.remove(football);
        scene.add(football);
        football.position.set(
            state.currentPlayer.position.x,
            footbally,
            state.currentPlayer.position.z,
        );
        state.carrying = false;
        state.dribbling = false;
        state.dribbleState = 0;
    }
    updateboxF();
}

function dribble(x, y, z) {
    if(!state.dribbling && state.currentbbox.intersectsBox(boxF)) {
        scene.remove(football);
        state.currentPlayer.add(football);
        football.position.set(
            0,
            -20 + footbally,
            0,
        );
        state.dribbling = true;
        state.dribbleDirection.set(x, y, z);
    }

    if(state.dribbling) {
        updateboxF();
        let rad = (boxF.max.x - boxF.min.x)/2;
        football.rotateOnWorldAxis(
            new THREE.Vector3(1,0,0),
            z*cspeed/rad
        );
        football.rotateOnWorldAxis(
            new THREE.Vector3(0,0,1),
            -x*cspeed/rad
        );

        let step = 0.4;
        state.dribbleState += step*(x+y+z)
        football.position.x = x*5 + 2*x*Math.cos(state.dribbleState);
        football.position.z = z*5 + 2*z*Math.cos(state.dribbleState);
        if(Math.abs(state.dribbleState) >= 4*Math.PI) {
            state.dribbleState = 0;
        }
    }
}

function freeMove(x, y, z) {
    updateboxF();
    drop();
    if(state.currentbbox.intersectsBox(boxF)) {
        state.kickGoing = false;
        state.ballSpeed.set(mspeed*x, mspeed*y, mspeed*z);
    }
}

function kick() {
    if(state.dribbling) {
        drop();
        state.mode = FREEMOVE;

        let g2box = new THREE.Box3();
        g2box.setFromObject(state.currentGoalPost);
        let cent = new THREE.Vector3();
        g2box.getCenter(cent);

        let x = cent.x - football.position.x;
        let y = 200 - football.position.y;
        let z = cent.z - football.position.z;

        // didn't normalize this intentionally, kicks from far away will go faster
        
        state.ballSpeed.set(kspeed*x, kspeed*y, kspeed*z);
        state.kickGoing = true;
        state.kickTime = 0;
    }
}


// collisions
function checkBallCollision(){
    staticBoxes.forEach(function(box) {
        if(box.intersectsBox(boxF)){
            let i = state.ballSpeed.clone();
            i.set(-i.x, -i.y, -i.z);

            let deflection = new THREE.Vector3();
            deflection.x = 30*(Math.random() * 2 - 1);
            deflection.y = 30*(Math.random() * 2 - 1);
            deflection.z = 30*(Math.random() * 2 - 1);

            let r = new THREE.Vector3();
            r.addVectors(i, deflection);

            state.ballSpeed.set(restitution*r.x, restitution*r.y, restitution*r.z);
            if(!state.kickGoing) {
                state.ballSpeed.y = 0;
            }
            football.position.x += 0.03*state.ballSpeed.x;
            football.position.z += 0.03*state.ballSpeed.z;
            return;
            // set speed wrt normals here
        }
    });
}

function checkPlayerCollision(person){
    updateboxPl();
    var flag = false;
    staticBoxes.forEach(function(box) {
        if(state.currentbbox.intersectsBox(box)){
            flag = true;
            return;
            // return true;
            // set speed wrt normals here
        }
    });
    return flag;
}

// THE KEYPRESS EVENTS
document.addEventListener('keydown', function(event) {
    if(event.code == 'KeyP') {
        drop();
        state.mode = FREEMOVE;
        camera = topcamera;
        player1.visible = true;
        player2.visible = true;
        if(state.currentPlayer == player1) {
            state.currentPlayer = player2;
            state.currentHelper = player2Helper;
            state.currentbbox = boxPl2;
            state.currentfps = player2fpsCamera;
            state.currenttps = player2tpsCamera;
            state.currentGoalPost = goalPost2;
        }
        else {
            state.currentPlayer = player1;
            state.currentHelper = player1Helper;
            state.currentbbox = boxPl1;
            state.currentfps = player1fpsCamera;
            state.currenttps = player1tpsCamera;
            state.currentGoalPost = goalPost1;
        }
    }
    if(event.code == 'Digit1'){
        console.log('do Q');
        state.currentPlayer.visible = true;
        camera = topcamera;
        renderer.render(scene, camera);
    }
    else if(event.code == 'Digit2'){
        state.currentPlayer.visible = false;
        camera = state.currentfps;
        console.log('do W');
        renderer.render(scene, camera);

    }
    else if(event.code == 'Digit3'){
        state.currentPlayer.visible = true;
        camera = state.currenttps;
        console.log('do E');
        renderer.render(scene, camera);
    }
    else if(event.code == 'KeyA'){
        if(camera == state.currentfps){
            camera.rotateOnWorldAxis(
                new THREE.Vector3(0,1,0),
                0.01
            );           
        }
    }
    else if(event.code == 'KeyD'){
        if(camera == state.currentfps){
            camera.rotateOnWorldAxis(
                new THREE.Vector3(0,1,0),
                -0.01
            );             
        }
    }

    else if(event.code == 'KeyC') {
        if(state.mode == CARRY) {
            drop();
            state.mode = FREEMOVE;
        }
        else {
            state.mode = CARRY;
            carry();
        }
    }

    else if(event.code == 'KeyM') {
        if(state.mode == DRIBBLE) {
            drop();
            state.mode = FREEMOVE;
        }
        else {
            state.mode = DRIBBLE;
            dribble(0,0,0);
        }
    }

    else if(event.code == 'ArrowUp') {

        let coeff = 1;
        if(state.currentPlayer == player2) coeff = -1;
        state.currentPlayer.position.z -= coeff * cspeed;

        if(checkPlayerCollision(state.currentPlayer)){
            state.currentPlayer.position.z += 10 * coeff * cspeed;
        }

        updateboxPl();

        if(state.mode == CARRY) {
            carry();
        }
        else if(state.mode == DRIBBLE) {
            dribble(0,0,-1);
        }
        else {
            freeMove(0,0,-coeff);
        }
    }

    else if(event.code == 'ArrowDown') {

        let coeff = 1;
        if(state.currentPlayer == player2) coeff = -1;
        state.currentPlayer.position.z += coeff * cspeed;

        if(checkPlayerCollision(state.currentPlayer)){
            state.currentPlayer.position.z -= 10 * coeff * cspeed;
        }
        
        updateboxPl();

        if(state.mode == CARRY) {
            carry();
        }
        else if(state.mode == DRIBBLE) {
            dribble(0,0,1);
        }
        else {
            freeMove(0,0,coeff);
        }
    }

    else if(event.code == 'ArrowRight') {

        let coeff = 1;
        if(state.currentPlayer == player2) coeff = -1;
        state.currentPlayer.position.x += coeff * cspeed;

        if(checkPlayerCollision(state.currentPlayer)){
            state.currentPlayer.position.x -= 10*coeff * cspeed;
        }
        updateboxPl();
        
        if(state.mode == CARRY) {
            carry();
        }
        else if(state.mode == DRIBBLE) {
            dribble(1,0,0);
        }
        else {
            freeMove(coeff,0,0);
        }
    }

    else if(event.code == 'ArrowLeft') {

        let coeff = 1;
        if(state.currentPlayer == player2) coeff = -1;
        state.currentPlayer.position.x -= coeff * cspeed;

        if(checkPlayerCollision(state.currentPlayer)){
            state.currentPlayer.position.x += 10*coeff * cspeed;
        }
        
        updateboxPl();
        
        if(state.mode == CARRY) {
            carry();
        }
        else if(state.mode == DRIBBLE) {
            dribble(-1,0,0);
        }
        else {
            freeMove(-coeff,0,0);
        }
    }

    else if(event.code == 'KeyK') {
        if(state.mode == DRIBBLE) {
            kick();
        }
    }

});


// THE KEYPRESS EVENTS
document.addEventListener('keyup', function(event) {
    
    if(event.code == 'ArrowUp') {
        if(state.mode == DRIBBLE) {
            state.dribbleState = 0;
        }
    }
    else if(event.code == 'ArrowDown') {
        if(state.mode == DRIBBLE) {
            state.dribbleState = 0;
        }
    }
    else if(event.code == 'ArrowRight') {
        if(state.mode == DRIBBLE) {
            state.dribbleState = 0;
        }
    }
    else if(event.code == 'ArrowLeft') {
        if(state.mode == DRIBBLE) {
            state.dribbleState = 0;
        }
    }
});


function animate() {
    
    render();
    requestAnimationFrame(animate);
}

function render() {

    state.currenttps.lookAt(
        state.currentPlayer.position.x,
        state.currentPlayer.position.y,
        state.currentPlayer.position.z
    );
    state.currenttps.updateProjectionMatrix();

    let delta = clock.getDelta();
    football.position.x += delta * state.ballSpeed.x;
    football.position.y += delta * state.ballSpeed.y;
    football.position.z += delta * state.ballSpeed.z;

    if(football.position.y <= footbally && state.mode == FREEMOVE){
        football.position.y = footbally;
        state.ballSpeed.set(
            dAtten*state.ballSpeed.x,
            state.ballSpeed.y,
            dAtten*state.ballSpeed.z
        );
    }

    let rad = (boxF.max.x - boxF.min.x)/2;
    football.rotateOnWorldAxis(
        new THREE.Vector3(1,0,0),
        (delta * state.ballSpeed.z)/rad
    );
    football.rotateOnWorldAxis(
        new THREE.Vector3(0,0,1),
        -(delta * state.ballSpeed.x)/rad
    );

    if(!state.kickGoing) {
        state.ballSpeed.set(
            dAtten*state.ballSpeed.x,
            0,
            dAtten*state.ballSpeed.z
        );
    }
    else if(state.kickGoing) {
        state.kickTime += delta;
        updateboxF();

        if(groundBox.intersectsBox(boxF)) {
            state.ballSpeed.set(
                dAtten*state.ballSpeed.x,
                -kvAtten*state.ballSpeed.y,
                dAtten*state.ballSpeed.z
            );
        }
        else {
            state.ballSpeed.set(
                dragAtten*state.ballSpeed.x,
                dragAtten*(state.ballSpeed.y  + gravity*state.kickTime),
                dragAtten*state.ballSpeed.z
            );
        }

        if( (Math.abs(state.ballSpeed.x) < 30) &&
            (Math.abs(state.ballSpeed.z) < 30)
        ) {
            state.kickGoing = false;
            state.ballSpeed.set(
                0,0,0
            );
        }

        if(football.position.y < -1) {
            football.position.set(
                0,footbally,0
            );
            state.kickGoing = false;
            state.ballSpeed.set(
                0,0,0
            );
        }
    }

    checkBallCollision();
    updateboxF();
    let bcent1 = new THREE.Vector3();
    boxF.getCenter(bcent1);

    let bcent2 = new THREE.Vector3();
    boxPl1.getCenter(bcent2);

    let bcent3 = new THREE.Vector3();
    boxPl2.getCenter(bcent3);

    if(groundCheck(bcent1) || groundCheck(bcent2) || groundCheck(bcent3)) {
        gamereset();
    }

    // console.log(state);
    renderer.render(scene,camera);

}

function gamereset() {
    football.position.set(0, footbally, 0);
    state.kickGoing = false;
    state.ballSpeed.set(
        0,0,0
    );
    player1.position.set(0, 20, 100);
    player2.position.set(0, 20, -100);
    updateboxF();
    player1Helper.clear();
    boxPl1 = new THREE.Box3();
    boxPl1.setFromObject(player1);
    boxPl1.expandByVector(new THREE.Vector3(2,17,2));
    player1Helper.add(new THREE.Box3Helper(boxPl1, 0xffff00));

    player2Helper.clear();
    boxPl2 = new THREE.Box3();
    boxPl2.setFromObject(player2);
    boxPl2.expandByVector(new THREE.Vector3(2,17,2));
    player2Helper.add(new THREE.Box3Helper(boxPl2, 0xffff00));
}

function groundCheck(pt) {
    return (pt.x > groundBox.max.x || pt.z > groundBox.max.z || pt.x < groundBox.min.x || pt.z < groundBox.min.z )
}

animate();
