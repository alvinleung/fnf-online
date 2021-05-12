import { Engine, Entity } from "./ecs";

// game engine modules
import InputSystem from "./input";
import { AssetLoader, AssetManager } from "./assets";
import { RenderingSystem } from "./graphics/RenderingSystem";
import { EventEmitter, IEventEmitter } from "./events/EventEmitter";

export enum GameEvent {
  UPDATE = "test",
}

export abstract class Game extends Engine implements IEventEmitter<GameEvent> {
  public readonly assets: AssetManager;
  public readonly input: InputSystem;
  private _rendering: RenderingSystem;
  private canvasElement: HTMLCanvasElement;

  private _eventEmitter: EventEmitter<GameEvent>;

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
    this.assets = this.setupAssets();
    Object.values(this.assets).forEach((assetLoader: AssetLoader<any>) => {
      assetLoader.loadAll();
      assetLoader.addLoadedListener(handleLoadProgress);
    });

    let that = this;

    function handleLoadProgress() {
      if (!that.isAllAssetAloaded()) return;
      // continue the rest of initialisation after all the assets loaded

      // setup the rendering system
      that._rendering = that.setupRendering();

      // setup other game systems
      that.setupSystems();

      // finished setup
      that.gameDidInit();

      // init the game
      that.tick();
    }
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
  fireEvent(eventType: GameEvent): void {
    return this._eventEmitter.fireEvent(eventType);
  }

  // getter for rendering system
  public get rendering() {
    return this._rendering;
  }

  private isAllAssetAloaded() {
    const isUnfinish = Object.values(this.assets).some(
      (assetLoader: AssetLoader<any>) => assetLoader.isLoaded() === false
    );
    return !isUnfinish;
  }

  private setupCanvas(): HTMLCanvasElement {
    const canvasElement = document.createElement("canvas");
    const scaleFactor = this.SCALE_FOR_RETINA_DISPLAY
      ? window.devicePixelRatio
      : 1;

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
  protected abstract setupAssets(): AssetManager;
  protected abstract setupRendering(): RenderingSystem;

  protected gameDidInit() {
    // finished initialisation
    // can probably do some
  }

  public getCanvas(): HTMLCanvasElement {
    // return this.renderer.domElement;
    return this.canvasElement;
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
