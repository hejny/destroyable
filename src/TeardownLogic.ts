import { IAwaitable } from './IAwaitable';
import { IDestroyable } from './IDestroyable';
import { IWork } from './IWork';

/**
 * @collboard-modules-sdk
 */
export type ITeardownLogic = IWork | IDestroyable;

/**
 *
 * @collboard-modules-sdk
 */
export async function teardown(
    teardownLogic?: ITeardownLogic | void,
): Promise<void> {
    if (teardownLogic === undefined) {
        return;
    } else if (typeof teardownLogic === 'function') {
        return teardownLogic();
    } else {
        return await teardownLogic.destroy();
    }
}

// TODO: Make compatible with IAwaitable<IDestroyable | undefined>
// TODO: Use in Registration.join
