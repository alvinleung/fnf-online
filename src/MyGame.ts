import { Entity } from "./engine/ecs";
import { AssetManager, ImageLoader } from "./engine/assets";
import { Game } from "./engine/Game";
import InputSystem, { KeyboardInput, MouseInput } from "./engine/input";
import { RenderingSystem } from "./engine/graphics/RenderingSystem";
import PlayerControlSystem from "./engine/core/PlayerControlSystem";
import { PlayerControlComponent } from "./engine/core/PlayerControlComponent";
import { SpriteSheetRenderable } from "./engine/graphics/SpriteSheet/SpriteSheetRenderable";
import { TransformComponent } from "./engine/core/TransformComponent";
import { SoundLoader } from "./engine/assets/SoundLoader";

import { Image } from "./engine/graphics/Image/Image";

import ASSET_DECLARATION from "./MyGameAssets";
import { Renderer3D } from "./engine/graphics/3dRender/Renderer3D";
import CameraComponent from "./engine/camera/CameraComponent";
import { RenderableComponent, RenderableObject } from "./engine/graphics/Renderable";
import { Plane } from "./engine/graphics/3dRender/objects/Plane";
import { SpriteSheetRenderPass } from "./engine/graphics/SpriteSheet/SpriteSheetRenderPass";
import { MetricsRenderPass } from "./engine/graphics/3dRender/MetricsRenderPass";
import { PhysicsSystem } from "./engine/core/PhysicsSystem";
import { fromEulerAngles } from "./engine/utils/quaternion";
import { DebugComponent } from "./engine/core/DebugComponent";
import { Cube } from "./engine/graphics/3dRender/objects/Cube";
import EditorControlSystem from "./engine/core/EditorControlSystem";
import { EditorControlComponent } from "./engine/core/EditorControlComponent";
import { GameStateParser } from "./engine/utils/GameStateParser";
import { DebugSystem } from "./engine/core/DebugSystem";
import EditorSystem from "./engine/core/EditorSystem";
import { SpriteSheetAnimator } from "./engine/graphics/SpriteSheet/SpriteSheetAnimator";
import { PhongRenderer } from "./engine/graphics/3dRender/PhongRenderer";
import { LightComponent } from "./engine/graphics/Light";
import { Sphere } from "./engine/graphics/3dRender/objects/Sphere";
import {
  wireFrameMaterialProperties,
  WireFrameRenderer,
} from "./engine/graphics/3dRender/WireframeRenderer";
import { TouchInput } from "./engine/input/TouchInput";
import { EditorServerIO } from "./engine/editor/EditorServerIO";

class MyGame extends Game {
  protected gameDidInit() {
    /**
     * Entity 1 - static
     */
    const squareEntity = new Entity();
    squareEntity.id = "square-entity-1";
    const image = this.assets.image.get("test");
    squareEntity.useComponent(TransformComponent);
    squareEntity.useComponent(RenderableComponent).renderableObject = new Plane(image);

    const transform = squareEntity.getComponent(TransformComponent);
    transform.scale = [1, 1, 0];
    transform.position = [0, 0, -1];

    new Cube();

    /**
     * Entity 1 - static
     */
    const squareEntity3 = new Entity();
    squareEntity3.useComponent(TransformComponent);
    squareEntity3.useComponent(RenderableComponent).renderableObject = new Plane(
      this.assets.image.get("test2")
    );
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
    squareEntity2.id = "square-entity-2";
    const transform2 = squareEntity2.useComponent(TransformComponent);
    transform2.position = [0, -1, -1];
    transform2.initialRotation = [0, 1, 1];

    squareEntity2.useComponent(RenderableComponent).renderableObject = new SpriteSheetRenderable(
      spriteSheetAnimation
    );

    /**
     * Entity 3 - Camera Controller
     */

    const cameraEntity = Entity.create("camera", [TransformComponent, CameraComponent]);
    const cameraTransform = cameraEntity.getComponent(TransformComponent);
    cameraTransform.position = [0, 1, 5];
    cameraTransform.rotation = fromEulerAngles(0, 0, 0);

    //console.log(cameraEntity.listComponents());

    const debugEntity = Entity.create("debug", [TransformComponent, DebugComponent]);
    debugEntity.useComponent(RenderableComponent).renderableObject = new Sphere(); //;
    debugEntity.getComponent(TransformComponent).position = [1, 1, 1];
    let debugRenderable = debugEntity.getComponent(RenderableComponent).renderableObject;
    debugRenderable
      .getMaterials()
      .addProperty("WireFrame", new wireFrameMaterialProperties(debugRenderable.objectCoords));
    //debugEntity.getComponent(TransformComponent).scale = [0.1, 4, 0.1];
    cameraEntity.useComponent(EditorControlComponent);

    this.addEntity(cameraEntity);
    this.addEntity(squareEntity);
    this.addEntity(squareEntity2);
    this.addEntity(squareEntity3);
    this.addEntity(debugEntity);
    // this.assets.sound.get("action-theme").play();
    // this.assets.sound.get("action-theme").play();

    // console.log(getPublicProperties(new TransformComponent));

    // const parser = GameStateParser.fromGame(this);
    // const entities = GameStateParser.fromString(parser.getString()).getEntities();

    // console.log(entities[1].getComponent(RenderableComponent));

    // this.removeEntity(squareEntity2);
    // this.addEntity(entities[1]);

    const light = new Entity();
    light.id = "light";
    let lightProperties = light.useComponent(LightComponent);
    lightProperties.color = [1, 1, 1];
    lightProperties.intensity = 1;
    lightProperties.isDirectional = true;
    light.useComponent(TransformComponent).position = [3, 3, 3];
    this.addEntity(light);
  }

  public loadScene(serializedScene: string) {
    super.loadScene(serializedScene);

    // inject the camera component
    this.entities.forEach((e) => {
      if (e.hasComponent(CameraComponent)) {
        e.useComponent(EditorControlComponent);
      }
    });
  }

  // @override
  protected setupInput(): InputSystem {
    const input = new InputSystem();

    // bind input
    const keyboard = new KeyboardInput(this);
    const mouse = new MouseInput(this);
    const trackpad = new TouchInput(this);

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

    input.bindAxis("editor:trackpad-x", trackpad.createAxisBinding("panX"));
    input.bindAxis("editor:trackpad-y", trackpad.createAxisBinding("panY"));
    input.bindAxis("editor:mouse-x", mouse.createAxisBinding("x"));
    input.bindAxis("editor:mouse-y", mouse.createAxisBinding("y"));

    input.bindAxis("editor:trackpad-zoom", trackpad.createAxisBinding("scroll"));
    input.bindAxis("editor:mouse-zoom", mouse.createAxisBinding("scroll"));
    // input.bindAxis("scroll", mouse.createAxisBinding("scroll"));
    input.bindAxis("pointerX", mouse.createAxisBinding("x"));
    input.bindAxis("pointerY", mouse.createAxisBinding("y"));

    input.bindAction("hoverMode", keyboard.createKeyBinding("ShiftLeft"));
    input.bindAction("speedMode", mouse.createKeyBinding("mouseright"));
    input.bindAction("editor:pan", keyboard.createKeyBinding("ShiftLeft"));

    input.bindAction("select", mouse.createKeyBinding("mouseleft"));

    input.bindAction("editor:mouse-left", mouse.createKeyBinding("mouseleft"));
    input.bindAction("editor:mouse-right", mouse.createKeyBinding("mouseright"));

    // hold middle button to look around
    mouse.setPointerLockButton("mousemiddle", true);

    input.bindAction("debug", keyboard.createKeyBinding("KeyX"));

    return input;
  }

  // @override
  protected setupAssets(assets: AssetManager) {
    assets.loadFromAssetSheet("/asset-sheet");
  }

  protected setupSystems() {
    // setup game logic
    this.addSystem(new PlayerControlSystem());
    this.addSystem(new EditorSystem());
    this.addSystem(new EditorControlSystem());
    this.addSystem(new DebugSystem());
  }

  protected setupRendering(): RenderingSystem {
    // add renderers here
    const renderers = [
      // new ImageRendererSetup(),
      // new SpriteSheetRendererSetup(),
      new SpriteSheetRenderPass(),
      new PhongRenderer(),
      new WireFrameRenderer(),
      new MetricsRenderPass(),
      //new GizmoPass(),
    ];
    const renderingSystem = new RenderingSystem(renderers);
    this.addSystem(renderingSystem);

    return renderingSystem;
  }
}

export default MyGame;
