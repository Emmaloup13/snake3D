import * as THREE from 'three';
import { MeshBasicMaterial } from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const width = 640;
const height = 480;

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
// scene.background = new THREE.MeshBasicMaterial({ color: 0x000000 })
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(width, height);
jeu.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, jeu);


function createCube(x, y) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(x, y, 0);
    scene.add(cube);
    return cube;
}


//Adaptation de mon code 2D en 3D, code plus simple
class Snake {
    lastPositions = [[]];
    direction = [0, -1];
    blocks = [];
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.head = createCube(x, y);
        for (let i = 1; i <= 5; i++) {
            this.blocks.push(createCube(0, -i));
            this.lastPositions.push([0, -i]);
        }
    }
    moveBlocks() {
        let n = this.lastPositions.length
        for (let i = 0; i < this.blocks.length; i++) {
            this.blocks[i].position.set(
                this.lastPositions[n - 1 - i][0],
                this.lastPositions[n - 1 - i][1],
                0);
        }
    }
    move() {
        this.lastPositions.push([this.x, this.y]);
        if (this.x < -10 || this.x > 10) {
            //out of bounds
            this.x = -this.x;
        }
        if (this.y < -10 || this.y > 10) {
            //out of bounds
            this.y = -this.y;
        }
        this.x += this.direction[0];
        this.y += this.direction[1];
        this.head.position.set(this.x, this.y, 0);
        if (this.lastPositions.length > this.blocks.length + 2) {
            this.lastPositions.shift();
        }
        this.moveBlocks();
    }
    checkCollisionWithBlocks() {
        for (let i = 0; i < this.blocks.length; i++) {
            const block = this.blocks[i];
            if (block.position.x == this.x && block.position.y == this.y) {
                init();
            }

        }
    }

    update() {
        this.move();
        this.checkCollisionWithBlocks();
    }
    addBlock() {
        let n = this.lastPositions.length;
        this.blocks.push(createCube(
            this.lastPositions[1][0],
            this.lastPositions[1][1]
        ));
    }
}

let snake;

class Food {
    x = 3;
    y = 0;
    constructor(x, y) {
        this.food = createCube(x, y);
        this.food.material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        this.x = x;
        this.y = y;
    }

    static getRandomFood() {
        function r_int(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
        }
        return new Food(r_int(-5, 5), r_int(-5, 5));
    }

    collision() {
        if (this.x === snake.x && this.y === snake.y) {
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

    camera.position.set(0, 0, 10);
    points = 0;
    snake = new Snake(0, 0);
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
                snake.direction = [-1, 0];
            }
            break;
        case 'ArrowRight':
            if (snake.direction[0] == 0) {
                snake.direction = [1, 0];
            }
            break;
        case 'ArrowUp':
            if (snake.direction[1] == 0) {
                snake.direction = [0, 1];
            }
            break;
        case 'ArrowDown':
            if (snake.direction[1] == 0) {
                snake.direction = [0, -1];
            }
            break;
        case '0':
            //On remet la caméra au point de départ
            camera.position.set(0, 0, 10);
        default:
            break;
    }
});