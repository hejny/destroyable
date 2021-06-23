import { Destroyable } from './Destroyable';

/**
 * @collboard-modules-sdk
 */
export class DestroyableLoop extends Destroyable {
    constructor(executor: (amIDestroyed: () => boolean) => Promise<void>) {
        super();
        executor(() => this.isDestroyed);
    }
}
