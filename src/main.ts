import * as THREE from "three";
import "./main.css";

// game engine modules
import InputSystem, { KeyboardInputProcessor } from "./engine/Input/Input";

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
  const keyboard = new KeyboardInputProcessor();
  InputSystem.bindControl("left", keyboard.useKeyBinding("keyA"));
  InputSystem.bindControl("right", keyboard.useKeyBinding("keyD"));
  InputSystem.bindControl("up", keyboard.useKeyBinding("keyW"));
  InputSystem.bindControl("down", keyboard.useKeyBinding("keyS"));
  InputSystem.bindControl("attack", keyboard.useKeyBinding("space"));
}

function update(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera
) {
  if (InputSystem.isActive("left")) {
    console.log("left");
  }

  // render the scene
  renderer.render(scene, camera);

  // get ready for next update
  requestAnimationFrame(() => {
    update(renderer, scene, camera);
  });
}

init();
