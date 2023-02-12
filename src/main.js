//Mindshow Grumpy Cat by Tipatat Chennavasin [CC-BY] (https://creativecommons.org/licenses/by/3.0/) via Poly Pizza (https://poly.pizza/m/eG1Y1s88sKq)

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

const width = 840;
const height = 680;

let points;

const jeu = document.getElementById("jeu");

let score = document.getElementById("points");
let scoretxt = document.getElementById("txt");

function updatePoints() {
    score.textContent = " " + points;
    if (points >= 2) {
        scoretxt.textContent = " points";
    } else if (points == 1) {
        scoretxt.textContent = " point"
    }
    else { scoretxt.textContent = "" }
}

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(width, height);
jeu.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, jeu);

const cubeSize = 20;




function createCube(x, y, z) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(x, y, z);
    scene.add(cube);
    return cube;
}


//Adaptation de mon code 2D en 3D, code plus simple
class Snake {
    lastPositions = [];
    direction = [0, -1, 0];
    blocks = [];
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.head = createCube(x, y, z);
        for (let i = 1; i <= 5; i++) {
            this.blocks.push(createCube(0, -i, 0));
            this.lastPositions.push([0, -i, 0]);
        }
    }
    moveBlocks() {
        let n = this.lastPositions.length
        for (let i = 0; i < this.blocks.length; i++) {
            this.blocks[i].position.set(
                this.lastPositions[n - 1 - i][0],
                this.lastPositions[n - 1 - i][1],
                this.lastPositions[n - 1 - i][2]);
        }
    }
    move() {
        this.lastPositions.push([this.x, this.y, this.z]);
        if (this.x < -10 || this.x > 10) {
            //out of bounds
            this.x = -this.x;
        }
        if (this.y < -10 || this.y > 10) {
            //out of bounds
            this.y = -this.y;
        }
        if (this.z < -10 || this.z > 10) {
            //out of bounds
            this.z = -this.z;
        }
        this.x += this.direction[0];
        this.y += this.direction[1];
        this.z += this.direction[2];
        this.head.position.set(this.x, this.y, this.z);
        if (this.lastPositions.length > this.blocks.length + 2) {
            this.lastPositions.shift();
        }
        this.moveBlocks();
    }
    checkCollisionWithBlocks() {
        for (let i = 0; i < this.blocks.length; i++) {
            const block = this.blocks[i];
            if (block.position.x == this.x && block.position.y == this.y && block.position.z == this.z) {
                init();
            }

        }
    }

    update() {
        this.move();
        this.checkCollisionWithBlocks();
    }
    addBlock() {
        this.blocks.push(createCube(
            this.lastPositions[1][0],
            this.lastPositions[1][1],
            this.lastPositions[1][2]
        ));
    }
}

let snake;

class Food {
    x = 3;
    y = 0;
    z = 0;
    constructor(x, y, z) {
        this.food = createCube(x, y, z);
        this.food.material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static getRandomFood() {
        function r_int(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
        }
        return new Food(r_int(-5, 5), r_int(-5, 5), r_int(-5, 5));
    }

    collision() {
        if (this.x === snake.x && this.y === snake.y && this.z === snake.z) {
            scene.remove(this.food);
            food = Food.getRandomFood();
            snake.addBlock();
            points++;
        }
    }
}


let food;

function init() {
    scene.clear();

    const gameCube = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    gameCube.material = new THREE.LineBasicMaterial({ color: 0xffffff });
    const gameCubeMesh = new THREE.Mesh(gameCube.geometry, gameCube.material);
    gameCubeMesh.position.set(0, 0, 0);

    let edges = new THREE.EdgesGeometry(gameCube);
    scene.add(new THREE.LineSegments(edges, gameCube.material));

    const ambient = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambient);

    const frontLight = new THREE.PointLight(0xf0ce26, 100, 500);
    frontLight.position.set(-2, 0, 10);
    scene.add(frontLight);

    const backLight = new THREE.PointLight(0x117ebd, 100, 500);
    backLight.position.set(4, 0, -5);
    scene.add(backLight);

    // const sphereSize = 1;
    // const pointLightHelper1 = new THREE.PointLightHelper(frontLight, sphereSize);
    // scene.add(pointLightHelper1);
    // const pointLightHelper2 = new THREE.PointLightHelper(backLight, sphereSize);
    // scene.add(pointLightHelper2);
    {
        const mtlLoader = new MTLLoader();
        mtlLoader.setResourcePath('resources/grumpyCat/');
        mtlLoader.load('materials.mtl', (mtl) => {
            mtl.preload();

            const objLoader = new OBJLoader();
            objLoader.setMaterials(mtl);
            objLoader.setResourcePath('resources/grumpyCat/');
            objLoader.load('cat.obj', (root) => {
                console.log("yup")
                root.position.set(0, 0, 25);
                scene.add(root.scene);
            });
        });
    }
    camera.position.set(0, 0, 25);
    camera.lookAt(scene.position);
    points = 0;
    snake = new Snake(0, 0, 0);
    food = Food.getRandomFood();
}

init();


function update() {
    snake.update();
    food.collision();
    setTimeout(update, 250);
}

update();

function render() {

    requestAnimationFrame(render);
    controls.update();
    updatePoints();
    renderer.render(scene, camera);
}
render();

window.addEventListener('keydown', function (e) {
    console.log(e.key);
    switch (e.key) {
        case 'ArrowLeft':
            if (snake.direction[0] == 0) {
                snake.direction = [-1, 0, 0];
            }
            break;
        case 'ArrowRight':
            if (snake.direction[0] == 0) {
                snake.direction = [1, 0, 0];
            }
            break;
        case 'ArrowUp':
            if (snake.direction[1] == 0) {
                snake.direction = [0, 1, 0];
            }
            break;
        case 'ArrowDown':
            if (snake.direction[1] == 0) {
                snake.direction = [0, -1, 0];
            }
            break;
        case '0':
            //On remet la caméra au point de départ
            camera.position.set(0, 0, 10);
        case 'z':
            if (snake.direction[2] == 0) {
                snake.direction = [0, 0, -1];
            }
            break;
        case 's':
            if (snake.direction[2] == 0) {
                snake.direction = [0, 0, 1];
            }
            break;
        default:
            break;
    }
});