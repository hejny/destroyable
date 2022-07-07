/**
 * @collboard-modules-sdk
 */
export interface IRegisterItemsOptions<TBaseType, TItem> {
    /**
     * Base will be mutated in every call of registerItemsInWhateher functions and when the returned registration is destroyed
     */
    base: TBaseType;

    /**
     * Add is array of items which will be added into base
     */
    add: TBaseType;

    /**
     * This function will compare if two items either from base or add are equal.
     * @default compare value is (a, b) => a === b
     */
    compare?: (a: TItem, b: TItem) => boolean;

    /**
     * What will happen when item from add is already in base or if item is not in base when destroing the registration.
     * - **ERROR** will throw an CollisionError in adding and NotFoundError in case of removing
     * - **SKIP** will just ignore this item
     * - **OVERRIDE** will re-write existing item *(is cases of simple comparision this can behave same as SKIP)*
     */
    collisionStrategy?: 'ERROR' | 'WARN' | 'SKIP' | 'OVERRIDE';
}

/**
 * TODO: Maybe there should exist some object that will represent registrations ad a whole above array/record
 */
