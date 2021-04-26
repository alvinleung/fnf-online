import { Entity } from "./engine/ecs";
import { AssetManager, ImageLoader } from "./engine/Assets/";
import Game from "./engine/Game";
import InputSystem, { KeyboardInput, MouseInput } from "./engine/input";
import Image from "./engine/rendering/Image";
import ImageRenderer from "./engine/rendering/ImageRenderer";
import RenderingComponent from "./engine/rendering/RenderingComponent";
import RenderingSystem from "./engine/rendering/RenderingSystem";

class MyGame extends Game {
  protected gameDidInit() {
    // ready to go! do some crazy shit here
    const testEntity = new Entity();
    // insert and configure component
    const imageRenderer = testEntity.useComponent(ImageRenderer);
    imageRenderer.setImage(this.assets.image.get("test"));
  }

  // @override
  protected setupInput(): InputSystem {
    const input = new InputSystem();

    // bind input
    const keyboard = new KeyboardInput();
    const mouse = new MouseInput();

    input.bindAction("left", keyboard.createKeyBinding("KeyA"));
    input.bindAction("right", keyboard.createKeyBinding("KeyD"));
    input.bindAction("up", keyboard.createKeyBinding("KeyW"));
    input.bindAction("down", keyboard.createKeyBinding("KeyS"));

    input.bindAction("attack", keyboard.createKeyBinding("space"));

    input.bindAxis("x", keyboard.createAxisBinding("KeyA|KeyD"));
    input.bindAxis("y", keyboard.createAxisBinding("KeyW|KeyS"));

    return input;
  }

  protected setupAssets(): AssetManager {
    const imageLoader = new ImageLoader();

    imageLoader.add(
      "test",
      require("../assets/spritesheets/Adventurer/adventurer-Sheet.png")
    );

    imageLoader.loadAll();

    return {
      image: imageLoader,
    };
  }

  protected setupSystems() {
    this.addSystem(new RenderingSystem());
  }
}

export default MyGame;
