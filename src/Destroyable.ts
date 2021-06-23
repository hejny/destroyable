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
    // tslint:disable-next-line
    private _isDestroyed = false;

    private subdestroyable: ITeardownLogic[] = [];

    /**
     * TODO: !!! isDestroyed
     */
    public get isDestroyed(): boolean {
        return this._isDestroyed;
    }
    public async destroy(): Promise<void> {
        this.checkWhetherNotDestroyed();
        this._isDestroyed = true;
        // console.log(`Destroying`, this);
        for (const subdestroyable of this.subdestroyable) {
            await teardown(subdestroyable);
        }
    }

    /**
     * Binds new registration with itself. This registration/destroyable will be destroyed with this.
     */
    public addSubdestroyable(...subdestroyable: ITeardownLogic[]): this {
        // TODO: create remove counterpart to add
        this.subdestroyable.push(...subdestroyable);
        return this;
    }

    /**
     * Checks, whether the object is not destroyed
     *
     * @param errorMessage Message that will replace default one before error
     * @param runBeforeError Callback runed before error is thrown; typically this can be some logging
     */
    protected checkWhetherNotDestroyed(
        errorMessage?: string,
        runBeforeError?: () => void,
    ) {
        if (this._isDestroyed) {
            if (runBeforeError) {
                runBeforeError();
            }
            throw new AlreadyDestroyedError(
                errorMessage || `This object is already destroyed.`,
            );
        }
    }
}
