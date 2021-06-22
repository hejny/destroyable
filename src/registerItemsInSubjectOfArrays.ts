import { Subject } from 'rxjs' /* TODO: Shrink just to an interface */;
import { Registration } from "./Registration";

/**
 * @deprecated TODO: instead of this interface use shared IRegisterItemsOptions
 */
interface IRegisterItemsInSubjectOfArrays<T> {
    /**
     * TODO: Allow this to be omited in case of base is BehaviorSubject
     */
    currentValue: T[];
    base: Subject<T[]>;
    add: T[];
    compare?: (a: T, b: T) => boolean;
    errorReporting?: (error: Error) => void;
}

/**
 * Push item into array of RxJS subjects and return object representing this pushment that can be destroyed
 * @param base will automatically triggers next in given subject and when unregistered triggers another one
 * @param add is array of items which will be added into base
 */
export function registerItemsInSubjectOfArrays<T>({
    currentValue,
    base,
    add,
    compare,
    errorReporting,
}: IRegisterItemsInSubjectOfArrays<T>) {
    const errorReportingFunction =
        errorReporting ||
        ((error: Error) => {
            throw error;
        });

    let baseFrameLast: T[] = currentValue;
    const subscription = base.subscribe((baseFrameCurrent) => {
        baseFrameLast = baseFrameCurrent;
    });

    base.next([...currentValue, ...add]);

    return new Registration(() => {
        subscription.unsubscribe();

        if (baseFrameLast === null){ return;   }

        baseFrameLast = [...baseFrameLast];

        for (const item of add) {
            const index = baseFrameLast.findIndex((item2) => (compare || ((a, b) => a === b))(item, item2));
            if (index === -1) {
                console.info({ base, baseFrameLast, item });
                errorReportingFunction(
                    Error(
                        `Item was not found in last item of subject of arrays. Into subject was probbably pushed next by non-compatible sources.`,
                    ),
                );
            }
            baseFrameLast.splice(index, 1);
        }

        base.next(baseFrameLast);
    });
}
