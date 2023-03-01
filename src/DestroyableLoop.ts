import { Destroyable } from './Destroyable';


export class DestroyableLoop extends Destroyable {
    constructor(executor: (amIDestroyed: () => boolean) => Promise<void>) {
        super();
        executor(() => this.isDestroyed);
    }
}
