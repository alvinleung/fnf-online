import { AssetManager } from "./engine/Assets/";
import Game from "./engine/Game";
import InputSystem, { KeyboardInput, MouseInput } from "./engine/Input";

class MyGame extends Game {
  // @override
  protected setupInput(): InputSystem {
    const inputSystem = new InputSystem();

    // bind input
    const keyboard = new KeyboardInput();
    const mouse = new MouseInput();

    inputSystem.bindAction("left", keyboard.createKeyBinding("KeyA"));
    inputSystem.bindAction("right", keyboard.createKeyBinding("KeyD"));
    inputSystem.bindAction("up", keyboard.createKeyBinding("KeyW"));
    inputSystem.bindAction("down", keyboard.createKeyBinding("KeyS"));

    inputSystem.bindAction("attack", keyboard.createKeyBinding("space"));

    inputSystem.bindAxis("x", keyboard.createAxisBinding("KeyA|KeyD"));
    inputSystem.bindAxis("y", keyboard.createAxisBinding("KeyW|KeyS"));

    return inputSystem;
  }

  protected setupAssets(): AssetManager {
    const assets = new AssetManager();

    return assets;
  }
}

export default MyGame;
