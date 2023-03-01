import { Promisable } from "type-fest";

/**
 * Represents object that is not destrioyed and can be
 */
export interface INotDestroyed {
  /**
   * Is destroyed?
   */
  readonly isDestroyed: false;

  /**
   * Destroy the object
   */
  destroy(): Promisable<void>;
}


/**
 * TODO: ACRY Maybe better name than not-destroyed - maybe unite destroyable and not-destroyed
 */