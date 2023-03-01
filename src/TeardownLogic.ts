import { IDestroyable } from './IDestroyable';
import { IWork } from './IWork';

/**
 * @@@
 */
export type ITeardownLogic = IWork | IDestroyable;

/**
 * @@@
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

// TODO: Use in Registration.join
