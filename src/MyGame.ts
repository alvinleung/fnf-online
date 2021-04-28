import { Entity } from "./engine/ecs";
import { AssetManager, ImageLoader } from "./engine/assets";
import { Game } from "./engine/Game";
import InputSystem, { KeyboardInput, MouseInput } from "./engine/input";
import {
  ImageRenderer,
  ImageRendererSetup,
} from "./engine/graphics/Image/ImageRenderer";
import { RenderingComponent } from "./engine/graphics/RenderingComponent";
import { RenderingSystem } from "./engine/graphics/RenderingSystem";
import { PositionComponent } from "./engine/core/PositionComponent";
import PlayerControlSystem from "./engine/core/PlayerControlSystem";
import { PlayerControlComponent } from "./engine/core/PlayerControlComponent";
import { SpriteSheetAnimator } from "./engine/graphics/SpriteSheet/SpriteSheet";
import {
  SpriteSheetRenderer,
  SpriteSheetRendererSetup,
} from "./engine/graphics/SpriteSheet/SpriteSheetRenderer";
import { TransformComponent } from "./engine/core/TransformComponent";

class MyGame extends Game {
  protected gameDidInit() {
    // ready to go! do some crazy shit here
    const testEntity = new Entity();
    // insert and configure component
    testEntity.useComponent(TransformComponent);
    const renderingComponent = testEntity.useComponent(RenderingComponent);
    const imageResource = this.assets.image.get("test");
    renderingComponent.setRenderer(new ImageRenderer(imageResource));

    // this.addEntity(testEntity);

    const spriteSheetAnimator = new SpriteSheetAnimator(
      imageResource,
      6,
      50,
      37
    );
    spriteSheetAnimator.defineAnimation("idle", 0, 3);
    spriteSheetAnimator.defineAnimation("crouch", 4, 7);
    spriteSheetAnimator.defineAnimation("run", 8, 13);
    spriteSheetAnimator.defineAnimation("jump", 14, 23);

    spriteSheetAnimator.loop("run");

    const animatingEntity = new Entity();

    // insert and configure component
    animatingEntity.useComponent(TransformComponent);
    animatingEntity
      .useComponent(RenderingComponent)
      .setRenderer(new SpriteSheetRenderer(spriteSheetAnimator));
    animatingEntity.useComponent(PlayerControlComponent);

    this.addEntity(animatingEntity);
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

    input.bindAction("attack", keyboard.createKeyBinding("Space"));

    input.bindAxis("horizontal", keyboard.createAxisBinding("KeyA|KeyD"));
    input.bindAxis("vertical", keyboard.createAxisBinding("KeyW|KeyS"));

    return input;
  }

  protected setupAssets(): AssetManager {
    const imageLoader = new ImageLoader();

    imageLoader.add({
      name: "test",
      path: require("url:../assets/spritesheets/Adventurer/adventurer-Sheet.png"),
    });

    return {
      image: imageLoader,
    };
  }

  protected setupSystems() {
    // setup game logic
    this.addSystem(new PlayerControlSystem());

    // add renderers here
    const rendererSetups = [
      new ImageRendererSetup(),
      new SpriteSheetRendererSetup(),
    ];
    this.addSystem(new RenderingSystem(rendererSetups));
  }
}

export default MyGame;
