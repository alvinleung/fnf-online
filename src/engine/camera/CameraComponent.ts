import { TransformComponent } from "../core/TransformComponent";
import { Component, Entity } from "../ecs";
import { Editable, Editor } from "../editor";

/**
 * This Component depends the TransformComponent
 */
export default class CameraComponent implements Component {
  public zoom: number = 0;
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
