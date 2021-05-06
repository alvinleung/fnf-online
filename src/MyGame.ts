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
import { PhysicsSystem } from "./engine/core/PhysicsSystem";
import { fromEulerAngles } from "./engine/utils/quaternion";
import { DebugComponent } from "./engine/core/DebugComponent";
import { Cube } from "./engine/graphics/3dRender/objects/Cube";
import EditorControlSystem from "./engine/core/EditorControlSystem";
import { EditorControlComponent } from "./engine/core/EditorControlComponent";
import { DebugSystem } from "./engine/core/DebugSystem";

class MyGame extends Game {
  protected gameDidInit() {
    /**
     * Entity 1 - static
     */
    const squareEntity = new Entity();
    squareEntity.id = "square-entity-1";
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
    squareEntity3.id = "square-entity-3";

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
    squareEntity2.id = "square-entity-3";
    const transform2 = squareEntity2.useComponent(TransformComponent);
    transform2.position = [0, -1, -1];

    squareEntity2.useComponent(
      RenderableComponent
    ).renderableObject = new SpriteSheetRenderable(spriteSheetAnimation);

    /**
     * Entity 3 - Camera Controller
     */

    const cameraEntity = Entity.create("camera", [
      TransformComponent,
      CameraComponent,
      EditorControlComponent,
    ]);
    const cameraTransform = cameraEntity.getComponent(TransformComponent);
    cameraTransform.position = [0, 1, 5];
    cameraTransform.rotation = fromEulerAngles(0.2, 0, 4);

    //console.log(cameraEntity.listComponents());

    const debugEntity = Entity.create("debug",[
      TransformComponent,
      DebugComponent,
    ])
    debugEntity.useComponent(RenderableComponent).renderableObject = new Cube();
    debugEntity.getComponent(TransformComponent).position = [1, 0, 1];
    debugEntity.getComponent(TransformComponent).scale = [0.1, 4, 0.1];

    this.addEntity(cameraEntity);
    this.addEntity(squareEntity2);
    //this.addEntity(squareEntity3);
    this.addEntity(squareEntity);
    this.addEntity(debugEntity);
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

    //input.bindAction("attack", keyboard.createKeyBinding("Space"));

    // player movements
    input.bindAxis("horizontal", keyboard.createAxisBinding("KeyA|KeyD"));
    input.bindAxis("foward", keyboard.createAxisBinding("KeyW|KeyS"));
    input.bindAxis("vertical", keyboard.createAxisBinding("KeyC|Space"));
    input.bindAxis("yawX", mouse.createAxisBinding("x"));
    input.bindAxis("yawY", mouse.createAxisBinding("y"));
    input.bindAction("hoverMode", keyboard.createKeyBinding("ShiftLeft"));
    input.bindAction("speedMode", mouse.createKeyBinding("mouseright"));

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
    //this.addSystem(new PlayerControlSystem());
    this.addSystem(new EditorControlSystem());
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
    this.addSystem(new DebugSystem());

    return renderingSystem;
  }
}

export default MyGame;
