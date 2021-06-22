import { AlreadyDestroyedError } from './AlreadyDestroyedError';
import { IDestroyable } from './IDestroyable';
import { ITeardownLogic, teardown } from './TeardownLogic';

/*
 * TODO: Unite Registration and Destroyable
 */

/**
 * Generic implementation of the IDestroyable
 *
 * @collboard-modules-sdk
 */
export abstract class Destroyable implements IDestroyable {
    private _destroyed = false;
    public get destroyed(): boolean {
        return this._destroyed;
    }
    public async destroy(): Promise<void> {
        this.checkWhetherNotDestroyed();
        this._destroyed = true;
        // console.log(`Destroying`, this);
        for (const subdestroyable of this.subdestroyable) {
            await teardown(subdestroyable);
        }
    }

    /**
     * Checks, whether the object is not destroyed
     *
     * @param errorMessage Message that will replace default one before error
     * @param runBeforeError Callback runed before error is thrown; typically this can be some logging
     */
    protected checkWhetherNotDestroyed(errorMessage?: string, runBeforeError?: () => void) {
        if (this._destroyed) {
            if (runBeforeError) {
                runBeforeError();
            }
            throw new AlreadyDestroyedError(errorMessage || `This object is already destroyed.`);
        }
    }

    private subdestroyable: ITeardownLogic[] = [];

    /**
     * Binds new registration with itself. This registration/destroyable will be destroyed with this.
     */
    public addSubdestroyable(...subdestroyable: ITeardownLogic[]): this {
        // TODO: create remove counterpart to add
        this.subdestroyable.push(...subdestroyable);
        return this;
    }
}
