import { IAwaitable } from './IAwaitable';

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
    destroy(): IAwaitable<void>;
}
