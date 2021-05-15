import { InputSourceFactory } from ".";
import { Game, GameEvent } from "../Game";

class Point {
  x: number;
  y: number;
}

const DAMPENING_FACTOR = 0.05;

export class TouchInput extends InputSourceFactory {
  private _panPosition: Point = { x: 0, y: 0 };
  private _panChange: Point = { x: 0, y: 0 };

  private _scroll: number = 0;
  private _scrollChange: number = 0;

  protected getAxisChange(axis: string): number {
    if (axis === "panX") return this._panChange.x;
    if (axis === "panY") return this._panChange.y;
    if (axis === "scroll") return this._scrollChange;
  }

  protected getAxis(axis: string): number {
    if (axis === "panX") return this._panPosition.x;
    if (axis === "panY") return this._panPosition.y;
    if (axis === "scroll") return this._scroll;
  }

  protected isActive(axis: string): boolean {
    return this._panChange[axis] !== 0;
  }
  protected wasClicked(axis: string): boolean {
    throw new Error("Method not implemented.");
  }

  constructor(game: Game) {
    super();
    this.addListeners(game);
  }

  private addListeners(game: Game) {
    const canvas = game.getCanvas();
    canvas.addEventListener("wheel", this.handleWheel.bind(this));

    // reset position every frame
    game.addEventListener(GameEvent.UPDATE, () => {
      this._panChange = { x: 0, y: 0 };
      this._scrollChange = 0;
    });
  }

  private handleWheel(e: WheelEvent) {
    if (e.metaKey || e.ctrlKey) {
      this._scroll += e.deltaY;
      this._scrollChange = e.deltaY;
    } else {
      this._panPosition = {
        x: this._panPosition.x + -e.deltaX,
        y: this._panPosition.y + -e.deltaY,
      };
      this._panChange = {
        x: -e.deltaX * DAMPENING_FACTOR,
        y: -e.deltaY * DAMPENING_FACTOR,
      };
    }
  }
}
