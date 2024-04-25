import { IDestroyable } from './IDestroyable';
import { IWork } from './IWork';

/**
 * @@@
 */
export type ITeardownLogic = IWork | IDestroyable;

/**
 * Asynchronously tears down a component or service using the provided teardown logic ⁘
 * 
 * @async
 * @function
 * @param {ITeardownLogic | void} [teardownLogic] - The teardown logic to use. If not provided, the function returns immediately.
 * @returns {Promise<void>} A promise that resolves when the teardown is complete.
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
