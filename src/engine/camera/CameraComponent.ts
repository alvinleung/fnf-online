import { TransformComponent } from "../core/TransformComponent";
import { Component, Entity } from "../ecs";
import { EditableComponent, EditableField, Editor } from "../editor";

/**
 * This Component depends the TransformComponent
 */
@EditableComponent
export default class CameraComponent implements Component {
  @EditableField(Editor.NUMBER)
  public fov: number = 54.4;

  @EditableField(Editor.NUMBER)
  public clipNear: number = 1;

  @EditableField(Editor.NUMBER)
  public clipFar: number = 2000;

  @EditableField(Editor.BOOLEAN)
  public isActive: boolean = true;

  private _followingEntity: Entity = null;

  public setFollowingEntity(entityToFollow: Entity) {
    // set entity to null if it follow nothing
    if (!entityToFollow) {
      this._followingEntity = null;
      return;
    }
    if (!entityToFollow.hasComponent(TransformComponent)) {
      console.warn(
        `Cannot follow entity ${entityToFollow.id} as it does not have a TransformComponent`
      );
    }
    this._followingEntity = entityToFollow;
  }

  public isFollowingEntity() {
    return this._followingEntity === null;
  }

  public getFollowingEntity() {
    return this._followingEntity;
  }
}
