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
    readonly destroyed: boolean;

    /**
     * Destroy the object
     */
    destroy(): IAwaitable<void>;
}
