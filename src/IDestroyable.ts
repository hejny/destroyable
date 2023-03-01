import { Promisable } from "type-fest";


/**
 * Represents object that can be destrioyed
 */
export interface IDestroyable {
  /**
   * Is destroyed?
   */
  readonly isDestroyed: boolean;

  /**
   * Destroy the object
   */
  destroy(): Promisable<void>;
}
