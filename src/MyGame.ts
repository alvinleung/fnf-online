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
import PlayerControlSystem from "./engine/core/PlayerControlSystem";
import { PlayerControlComponent } from "./engine/core/PlayerControlComponent";
import {
  SpriteSheetAnimation,
  SpriteSheetAnimator,
  SpriteSheetRenderable,
} from "./engine/graphics/SpriteSheet/SpriteSheetAnimation";
import {
  SpriteSheetRenderer,
  SpriteSheetRendererSetup,
} from "./engine/graphics/SpriteSheet/old_SpriteSheetRenderer";
import { TransformComponent } from "./engine/core/TransformComponent";
import { SoundLoader } from "./engine/assets/SoundLoader";

import ASSET_DECLARATION from "./MyGameAssets";
import { Renderer3D } from "./engine/graphics/3dRender/Renderer3D";
import CameraComponent from "./engine/camera/CameraComponent";
import { RenderableComponent } from "./engine/graphics/Renderable";
import { Plane } from "./engine/graphics/3dRender/objects/Plane";
import { SpriteSheetRenderPass } from "./engine/graphics/SpriteSheet/SpriteSheetRenderPass";

class MyGame extends Game {
  protected gameDidInit() {
    // ready to go! do some crazy shit here
    // const testEntity = new Entity();

    // insert and configure component
    // testEntity.useComponent(TransformComponent);
    // const renderingComponent = testEntity.useComponent(RenderingComponent);
    // const imageResource = this.assets.image.get("test");
    // renderingComponent.setRenderer(new ImageRenderer(imageResource));

    // this.addEntity(testEntity);

    // const spriteSheetAnimator = new SpriteSheetAnimator(
    //   imageResource,
    //   6,
    //   50,
    //   37
    // );
    // spriteSheetAnimator.defineAnimation("idle", 0, 3);
    // spriteSheetAnimator.defineAnimation("crouch", 4, 7);
    // spriteSheetAnimator.defineAnimation("run", 8, 13);
    // spriteSheetAnimator.defineAnimation("jump", 14, 23);

    // spriteSheetAnimator.loop("run");

    // const animatingEntity = new Entity();

    // insert and configure component

    // animatingEntity.useComponent(TransformComponent);
    // animatingEntity
    //   .useComponent(RenderingComponent)
    //   .setRenderer(new SpriteSheetRenderer(spriteSheetAnimator));
    // animatingEntity.useComponent(PlayerControlComponent);

    // this.addEntity(animatingEntity);

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
    transform.scaleX = 1;
    transform.scaleY = 1;
    transform.z = -1;

    /**
     * Entity 2 - animated entity
     */
    const spriteSheetAnimation = new SpriteSheetAnimator(image, 12, 50, 37);
    spriteSheetAnimation.defineAnimation("idle", 0, 3);
    spriteSheetAnimation.defineAnimation("crouch", 4, 7);
    spriteSheetAnimation.defineAnimation("run", 8, 13);
    spriteSheetAnimation.defineAnimation("jump", 14, 23);
    spriteSheetAnimation.loop("run");

    const squareEntity2 = new Entity();
    squareEntity2.useComponent(TransformComponent).z = -2;
    squareEntity2.useComponent(
      RenderableComponent
    ).renderableObject = new SpriteSheetRenderable(spriteSheetAnimation);

    /**
     * Entity 3 - Camera Controller
     */

    const cameraEntity = new Entity();
    cameraEntity.useComponent(TransformComponent).z = 2;
    cameraEntity.useComponent(CameraComponent);
    cameraEntity.useComponent(PlayerControlComponent);

    this.addEntity(cameraEntity);
    this.addEntity(squareEntity2);
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

    input.bindAxis("yawX", keyboard.createAxisBinding("ArrowLeft|ArrowRight"));
    // input.bindAxis("yawX", mouse.createDragBinding("mouseleft", "x"));
    input.bindAxis("yawY", mouse.createDragBinding("mouseleft", "y"));

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
  }

  protected setupRendering(): RenderingSystem {
    // add renderers here
    const renderers = [
      // new ImageRendererSetup(),
      // new SpriteSheetRendererSetup(),
      new SpriteSheetRenderPass(),
      new Renderer3D(),
    ];
    const renderingSystem = new RenderingSystem(renderers);
    this.addSystem(renderingSystem);

    return renderingSystem;
  }
}

export default MyGame;
