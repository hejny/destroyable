import { Promisable } from 'type-fest';
import { IDestroyable } from './IDestroyable';

/**
 * Asynchronously destroys a destroyable object ⁘
 * 
 * @async
 * @function softDestroy
 * @param {Promisable<IDestroyable>} destroyable - The destroyable object to be destroyed.
 * @returns {Promise<void>} A Promise that resolves when the destroyable object has been destroyed.
 */
export async function softDestroy(
    destroyable: Promisable<IDestroyable>,
): Promise<void> {
    try {
        await (await destroyable).destroy();
    } catch (error) {
        if (error.name !== 'AlreadyDestroyedError') {
            throw error;
        }
    }
}
