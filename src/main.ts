import * as THREE from "three";
import "./main.css";

// game engine modules
import InputSystem, { KeyboardInput, MouseInput } from "./engine/Input";

function init() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  scene.add(camera);

  camera.position.z = 5;

  // add the renderer to html
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // setup input
  setupInput();

  // start the update function
  update(renderer, scene, camera);
}

function setupInput() {
  const keyboard = new KeyboardInput();
  const mouse = new MouseInput();

  InputSystem.bindAction("left", keyboard.createKeyBinding("KeyA"));
  InputSystem.bindAction("right", keyboard.createKeyBinding("KeyD"));
  InputSystem.bindAction("up", keyboard.createKeyBinding("KeyW"));
  InputSystem.bindAction("down", keyboard.createKeyBinding("KeyS"));

  InputSystem.bindAction("attack", keyboard.createKeyBinding("space"));

  InputSystem.bindAxis("x", keyboard.createAxisBinding("KeyA|KeyD"));
  InputSystem.bindAxis("y", keyboard.createAxisBinding("KeyW|KeyS"));
}

function update(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera
) {
  if (InputSystem.getAxis("x") !== 0) {
    console.log("test " + InputSystem.getAxis("x"));
  }

  // render the scene
  renderer.render(scene, camera);

  // get ready for next update
  requestAnimationFrame(() => {
    update(renderer, scene, camera);
  });
}

init();
