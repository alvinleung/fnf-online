import { Entity } from "./engine/ecs";
import { AssetManager, ImageLoader } from "./engine/assets";
import { Game } from "./engine/Game";
import InputSystem, { KeyboardInput, MouseInput } from "./engine/input";
import { RenderingSystem } from "./engine/graphics/RenderingSystem";
import PlayerControlSystem from "./engine/core/PlayerControlSystem";
import { PlayerControlComponent } from "./engine/core/PlayerControlComponent";
import {
  SpriteSheetAnimator,
  SpriteSheetRenderable,
} from "./engine/graphics/SpriteSheet/SpriteSheetAnimation";
import { TransformComponent } from "./engine/core/TransformComponent";
import { SoundLoader } from "./engine/assets/SoundLoader";

import ASSET_DECLARATION from "./MyGameAssets";
import { Renderer3D } from "./engine/graphics/3dRender/Renderer3D";
import CameraComponent from "./engine/camera/CameraComponent";
import { RenderableComponent } from "./engine/graphics/Renderable";
import { Plane } from "./engine/graphics/3dRender/objects/Plane";
import { SpriteSheetRenderPass } from "./engine/graphics/SpriteSheet/SpriteSheetRenderPass";
import { MetricsRenderPass } from "./engine/graphics/3dRender/MetricsRenderPass";

class MyGame extends Game {
  protected gameDidInit() {
    /**
     * Entity 1 - static
     */
    const squareEntity = new Entity();
    const image = this.assets.image.get("test");
    squareEntity.useComponent(TransformComponent);
    squareEntity.useComponent(RenderableComponent).renderableObject = new Plane(
      image
    );

    const transform = squareEntity.getComponent(TransformComponent);
    transform.scale = [1, 1, 0];
    transform.position = [0, 0, -1];

    /**
     * Entity 1 - static
     */
    const squareEntity3 = new Entity();
    squareEntity3.useComponent(TransformComponent);
    squareEntity3.useComponent(
      RenderableComponent
    ).renderableObject = new Plane(image);
    
    const transform3 = squareEntity3.getComponent(TransformComponent);
    transform3.scale = [1, 1, 0];
    transform3.position = [0, 0, -5];

    /**
     * Entity 2 - animated entity
     */
    const spriteSheetAnimation = new SpriteSheetAnimator(image, 12, 50, 37);
    spriteSheetAnimation.defineAnimation("idle", 0, 3);
    spriteSheetAnimation.defineAnimation("crouch", 4, 7);
    spriteSheetAnimation.defineAnimation("run", 8, 13);
    spriteSheetAnimation.defineAnimation("jump", 14, 23);
    spriteSheetAnimation.loop("idle");

    const squareEntity2 = new Entity();
    const transform2 = squareEntity2.useComponent(TransformComponent);
    transform2.position = [0, -1, -1];

    squareEntity2.useComponent(
      RenderableComponent
    ).renderableObject = new SpriteSheetRenderable(spriteSheetAnimation);

    /**
     * Entity 3 - Camera Controller
     */

    const cameraEntity = new Entity();
    cameraEntity.useComponent(TransformComponent).position = [0, 0, 4];
    cameraEntity.useComponent(CameraComponent);
    cameraEntity.useComponent(PlayerControlComponent);


    this.addEntity(cameraEntity);
    this.addEntity(squareEntity2);
    //this.addEntity(squareEntity3);
    this.addEntity(squareEntity);
    // this.assets.sound.get("action-theme").play();
    // this.assets.sound.get("action-theme").play();
      
    // console.log(getPublicProperties(new TransformComponent));
    
  }


  // @override
  protected setupInput(): InputSystem {
    const input = new InputSystem();

    // bind input
    const keyboard = new KeyboardInput();
    const mouse = new MouseInput(this);
    mouse.enablePointerLockSetting();

    input.bindAction("left", keyboard.createKeyBinding("KeyA"));
    input.bindAction("right", keyboard.createKeyBinding("KeyD"));
    input.bindAction("up", keyboard.createKeyBinding("KeyW"));
    input.bindAction("down", keyboard.createKeyBinding("KeyS"));

    input.bindAction("attack", keyboard.createKeyBinding("Space"));

    input.bindAxis("horizontal", keyboard.createAxisBinding("KeyA|KeyD"));
    input.bindAxis("vertical", keyboard.createAxisBinding("KeyW|KeyS"));

    //input.bindAxis("yawX", keyboard.createAxisBinding("ArrowLeft|ArrowRight"));
    // input.bindAxis("yawX", mouse.createDragBinding("mouseleft", "x"));
    input.bindAxis("yawX", mouse.createAxisBinding("x"));
    input.bindAxis("yawY", mouse.createAxisBinding("y"));

    input.bindAction("debug",keyboard.createKeyBinding("KeyX"));

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
  }

  protected setupRendering(): RenderingSystem {
    // add renderers here
    const renderers = [
      // new ImageRendererSetup(),
      // new SpriteSheetRendererSetup(),
      new SpriteSheetRenderPass(),
      new Renderer3D(),
      new MetricsRenderPass(),
    ];
    const renderingSystem = new RenderingSystem(renderers);
    this.addSystem(renderingSystem);

    return renderingSystem;
  }

  

}

export default MyGame;
