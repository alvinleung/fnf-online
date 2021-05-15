import { Engine, Entity } from "./ecs";

// game engine modules
import InputSystem from "./input";
import { AssetLoader, AssetManager } from "./assets";
import { RenderingSystem } from "./graphics/RenderingSystem";
import { EventEmitter, IEventEmitter } from "./events/EventEmitter";
import { GameStateParser } from "./utils/GameStateParser";
import { AssetLoaderEvent } from "./assets/AssetLoader";

export enum GameEvent {
  UPDATE = "update",
  ENTITY_SELECT = "select-entity",
  ENTITY_LIST_CHANGE = "entity-list-change",
}

export abstract class Game extends Engine implements IEventEmitter<GameEvent> {
  public readonly assets: AssetManager;
  public readonly input: InputSystem;
  private _rendering: RenderingSystem;
  private canvasElement: HTMLCanvasElement;

  private _eventEmitter: EventEmitter<GameEvent> = new EventEmitter<GameEvent>();

  private _entitiesRefMap: { [name: string]: Entity } = {};

  // when enabled, it will render more pixels to make things
  // look cleaner in retina display, but it will increase
  // rendering cost
  public readonly SCALE_FOR_RETINA_DISPLAY: boolean = false;

  private previousTick = Date.now();

  constructor() {
    super();

    this.canvasElement = this.setupCanvas();
    this.input = this.setupInput();

    // setup load all assets
    this.assets = AssetManager.getInstance();
    this.setupAssets(this.assets);

    const handleLoadProgress = () => {
      if (!this.assets.haveAllAssetLoaded()) return;
      // continue the rest of initialisation after all the assets loaded

      // setup the rendering system
      this._rendering = this.setupRendering();

      // setup other game systems
      this.setupSystems();

      // finished setup
      this.gameDidInit();

      // init the game
      this.tick();

      // event listener clean up
      this.assets.removeEventListener(AssetLoaderEvent.COMPLETE, handleLoadProgress);
    };

    this.assets.addEventListener(AssetLoaderEvent.COMPLETE, handleLoadProgress);
    this.assets.loadAll();
  }

  addEventListener(eventType: GameEvent, callback: Function): void {
    this._eventEmitter.addEventListener(eventType, callback);
  }
  removeEventListener(eventType: GameEvent, callback: Function): void {
    this._eventEmitter.removeEventListener(eventType, callback);
  }
  hasEventListener(eventType: GameEvent, callback: Function): boolean {
    return this._eventEmitter.hasEventListener(eventType, callback);
  }
  fireEvent(eventType: GameEvent, payload?: any): void {
    return this._eventEmitter.fireEvent(eventType, payload);
  }

  // getter for rendering system
  public get rendering() {
    return this._rendering;
  }

  private setupCanvas(): HTMLCanvasElement {
    const canvasElement = document.createElement("canvas");
    const scaleFactor = this.SCALE_FOR_RETINA_DISPLAY ? window.devicePixelRatio : 1;

    // set the size
    canvasElement.width = window.innerWidth * scaleFactor;
    canvasElement.height = window.innerHeight * scaleFactor;
    canvasElement.style.width = "100vw";
    canvasElement.style.height = "100vh";
    window.addEventListener("resize", () => {
      canvasElement.width = window.innerWidth * scaleFactor;
      canvasElement.height = window.innerHeight * scaleFactor;
    });

    return canvasElement;
  }

  // create a system pipeline
  protected abstract setupSystems();

  // facotry function for binding input controls
  protected abstract setupInput(): InputSystem;
  protected abstract setupAssets(assetManager: AssetManager): void;
  protected abstract setupRendering(): RenderingSystem;

  protected gameDidInit() {
    // finished initialisation
    // can probably do some
  }

  public getCanvas(): HTMLCanvasElement {
    // return this.renderer.domElement;
    return this.canvasElement;
  }

  public saveScene() {
    const serializedScene = GameStateParser.fromGame(this).getString();
    console.log(serializedScene);
    return serializedScene;
  }

  public loadScene(sceneData: string) {
    // clean up all the entities in the scene first
    this.removeEntities(...this.entities);

    const newSceneEntities = GameStateParser.fromString(sceneData, this.assets.image).getEntities();
    this.addEntities(...newSceneEntities);
  }

  /**
   * Override addEntity method, each entity has a unique id when adding to the system.
   */
  public addEntity(entity: Entity): this {
    if (entity.isNew())
      throw new Error(
        `Unable to add entity: Entity "id" property need to be set before adding to the engine, currently null.`
      );

    if (this._entitiesRefMap[entity.id])
      throw new Error(
        `Unable to add entity: Entity with id ${entity.id} already exist in the system`
      );

    this._entitiesRefMap[entity.id] = entity;
    super.addEntity(entity);
    this.fireEvent(GameEvent.ENTITY_LIST_CHANGE, this.entities);

    return this;
  }

  public insertEntityAt(entity: Entity, index: number) {
    if (entity.isNew())
      throw new Error(
        `Unable to add entity: Entity "id" property need to be set before adding to the engine, currently null.`
      );

    if (this._entitiesRefMap[entity.id])
      throw new Error(
        `Unable to add entity: Entity with id ${entity.id} already exist in the system`
      );

    this._entitiesRefMap[entity.id] = entity;
    super.insertEntityAt(entity, index);
    this.fireEvent(GameEvent.ENTITY_LIST_CHANGE, this.entities);

    return this;
  }

  /**
   * Override addEntity to add mapping functionality
   */
  //@ts-ignore overrriding parent method with different signiture
  public removeEntity(entity: Entity) {
    const self = super.removeEntity(entity);
    // remove entity reference from the ref map list
    delete this._entitiesRefMap[entity.id];

    this.fireEvent(GameEvent.ENTITY_LIST_CHANGE, this.entities);
    return self;
  }

  /**
   * Override addEntity to add mapping functionality
   */
  public getEntityById(name: string): Entity {
    return this._entitiesRefMap[name];
  }

  private tick() {
    // update here
    const currentTick = Date.now();
    const deltaTimeInSeconds = (currentTick - this.previousTick) * 0.001;

    // update systems
    this.update(deltaTimeInSeconds);
    this.fireEvent(GameEvent.UPDATE);

    this.previousTick = currentTick;

    // get ready for next update
    requestAnimationFrame(() => {
      this.tick();
    });
  }
}
