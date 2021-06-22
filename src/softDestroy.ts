import { IAwaitable } from './IAwaitable';
import { IDestroyable } from './IDestroyable';

/**
 *
 * @collboard-modules-sdk
 */
export async function softDestroy(destroyable: IAwaitable<IDestroyable>): Promise<void> {
    try {
        await (await destroyable).destroy();
    } catch (error) {
        if (error.name !== 'AlreadyDestroyedError') {
            throw error;
        }
    }
}
