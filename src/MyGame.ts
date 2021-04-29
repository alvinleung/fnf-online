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
import { SoundLoader } from "./engine/assets/SoundLoader";

import ASSET_DECLARATION from "./MyGameAssets";
import { Renderer3D, Renderer3Dsetup } from "./engine/graphics/3dRender/Renderer3D";

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

    const squareEntity = new Entity();

    squareEntity.useComponent(TransformComponent);
    squareEntity.useComponent(RenderingComponent).setRenderer(new Renderer3D());
    squareEntity.useComponent(PlayerControlComponent);

    const transform = squareEntity.getComponent(TransformComponent);
    transform.scaleX = 0.2;
    transform.scaleY = 0.2;
    
    this.addEntity(squareEntity);

    // this.assets.sound.get("action-theme").play();
    // this.assets.sound.get("action-theme").play();
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

    input.bindAxis("yawX",mouse.createDragBinding("mouseleft","x"))
    input.bindAxis("yawY",mouse.createDragBinding("mouseleft","y"))

    console.log();

    return input;
  }

  // @override
  protected setupAssets(): AssetManager {
    const imageLoader = new ImageLoader();
    const soundLoader = new SoundLoader();

    ASSET_DECLARATION.images.forEach((imageAsset) => {
      imageLoader.add(imageAsset);
    });

    ASSET_DECLARATION.sounds.forEach((soundAsset) => {
      soundLoader.add(soundAsset);
    });

    return {
      image: imageLoader,
      sound: soundLoader,
    };
  }

  protected setupSystems() {
    // setup game logic
    this.addSystem(new PlayerControlSystem());

    // add renderers here
    const rendererSetups = [
      new ImageRendererSetup(),
      new SpriteSheetRendererSetup(),
      new Renderer3Dsetup(),
    ];
    this.addSystem(new RenderingSystem(rendererSetups));
  }
}

export default MyGame;
