import { NotFoundError } from './errors/NotFoundError';
import { IRegisterItemsOptions } from './IRegisterItemsOptions';
import { Registration } from './Registration';

/**
 * Push item into array and return object representing this pushment that can be destroyed
 * Warning: this utility makes mutations on base record object
 *
 * @collboard-modules-sdk
 */
export function registerItemsInArray<TItem>({
    base,
    add,
    compare,
    collisionStrategy,
}: IRegisterItemsOptions<TItem[], TItem>) {
    compare = compare || ((a, b) => a === b);
    collisionStrategy = collisionStrategy || 'ERROR';

    for (const item of add) {
        base.push(item);
    }

    return new Registration(() => {
        for (const item of add) {
            const index = base.findIndex((item2) => compare!(item, item2));
            if (index === -1) {
                const error = new NotFoundError(
                    `Item was not found in array. Array was probbably mutated with some other function.`,
                );

                if (collisionStrategy === 'ERROR') {
                    /*
                    // TODO: DRY
                    console.info(/* TODO: Unify error infos* / 'ERROR_INFO', {
                        error,
                        base /* TODO: Converting MobX * /,
                        item,
                    });
                    */
                    throw error;
                } else if (collisionStrategy === 'WARN') {
                    /*
                    // TODO: DRY
                    console.info(/* TODO: Unify error infos* / 'ERROR_INFO', {
                        error,
                        base /* TODO: Converting MobX * /,,
                        item,
                    });
                    */
                    console.warn(error);
                }
            }
            base.splice(index, 1);
        }
    });
}
