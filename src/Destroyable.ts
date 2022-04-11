import { AlreadyDestroyedError } from './AlreadyDestroyedError';
import { IDestroyable } from './IDestroyable';
import { ITeardownLogic, teardown } from './TeardownLogic';



/**
 * Generic implementation of the IDestroyable
 *
 * @collboard-modules-sdk
 */
export abstract class Destroyable implements IDestroyable {

    /**
     * Chcek whether the given object is destroyable
     */
    public static isDestroyable(obj: any): obj is IDestroyable {
        return obj && typeof obj.destroy === 'function'&& typeof obj.isDestroyed === 'boolean';
    }


    // tslint:disable-next-line
    private _isDestroyed = false;

    private subdestroyable: ITeardownLogic[] = [];

    /**
     * Is this object destroyed?
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
        // TODO: Create remove counterpart to add
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


/*
 * TODO: Unite Registration and Destroyable
 */