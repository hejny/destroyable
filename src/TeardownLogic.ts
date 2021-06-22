import { IAwaitable } from './IAwaitable';
import { IDestroyable } from './IDestroyable';

/**
 * @collboard-modules-sdk
 */
export type ITeardownLogic = (() => IAwaitable<void>) | IDestroyable;

/**
 *
 * @collboard-modules-sdk
 */
export async function teardown(teardownLogic: ITeardownLogic): Promise<void> {
    if (typeof teardownLogic === 'function') {
        return teardownLogic();
    } else {
        return await teardownLogic.destroy();
    }
}

// TODO: Make compatible with IAwaitable<IDestroyable | undefined>
// TODO: Use in Registration.join
