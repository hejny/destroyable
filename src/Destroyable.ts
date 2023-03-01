import { AlreadyDestroyedError } from './AlreadyDestroyedError';
import { IDestroyable } from './IDestroyable';
import { INotDestroyed } from './INotDestroyed';
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
        this.assertNotDestroyed();
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
     */
    protected assertNotDestroyed(
        errorMessage: string = `This object is already destroyed.`
    ): asserts this is INotDestroyed {
        if (this._isDestroyed) {

            throw new AlreadyDestroyedError(
                errorMessage
            );
        }
    }




}


/*
 * TODO: Unite Registration and Destroyable
 */