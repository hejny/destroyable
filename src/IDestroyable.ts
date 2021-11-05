import { Promisable } from "type-fest";

/**
 * Interface, all destroyable objects implement
 *
 * @collboard-modules-sdk
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
