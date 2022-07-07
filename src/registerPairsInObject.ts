import { CollisionError } from './errors/CollisionError';
import { NotFoundError } from './errors/NotFoundError';
import { IRegisterItemsOptions } from './IRegisterItemsOptions';
import { Registration } from './Registration';

/**
 * Push item into record object and return object representing this pushment that can be destroyed
 * Warning: this utility makes mutations on base record object
 *
 * @collboard-modules-sdk
 */

export function registerPairsInObject<TItem>({
    base,
    add,
    collisionStrategy,
}: Omit<IRegisterItemsOptions<Record<string, TItem>, TItem>, 'compare'>) {
    collisionStrategy = collisionStrategy || 'ERROR';

    const skippedKeys: string[] = [];
    const overrided: Record<string, TItem> = {};

    for (const [key, value] of Object.entries(add)) {
        if (base[key] !== undefined) {
            const error = new CollisionError(
                `Key "${key}" already exists in record.`,
            );
            if (collisionStrategy === 'ERROR') {
                throw error;
            } else if (collisionStrategy === 'WARN') {
                console.warn(error);
            } else if (collisionStrategy === 'SKIP') {
                skippedKeys.push(key);
            } else if (collisionStrategy === 'OVERRIDE') {
                overrided[key] = base[key];
                base[key] = value;
            }
        } else {
            base[key] = value;
        }
    }

    return new Registration(() => {
        for (const key of Object.keys(add)) {
            if (base[key] === undefined) {
                if (!skippedKeys.includes(key)) {
                    throw new NotFoundError(
                        `Key ${key} can not be destroyed in record.`,
                    );
                }
            } else {
                if (collisionStrategy === 'SKIP' && skippedKeys.includes(key)) {
                } else if (collisionStrategy === 'OVERRIDE' && overrided[key]) {
                    base[key] = overrided[key];
                } else {
                    delete base[key];
                }
            }
        }
    });
}
