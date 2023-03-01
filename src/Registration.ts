import { Promisable } from 'type-fest';
import { Destroyable } from './Destroyable';
import { IDestroyable } from './IDestroyable';
import { ISubscription } from './ISubscription';
import { ITick, IWaiter } from './IWork';
import { ITeardownLogic, teardown } from './TeardownLogic';

/**
 * This object will be returned by register functions to unregister things
 */
export class Registration extends Destroyable implements IDestroyable {
    /**
     *
     * TODO: Use in all places where manually setting up  pair things
     */
    public static create(
        creator: (utils: {
            isDestroyed: () => boolean;
        }) => Promisable<ITeardownLogic | void>,
    ): Registration {
        let isDestroyed = false;

        const teardownLogic = creator({ isDestroyed: () => isDestroyed });

        return new Registration(async () => {
            isDestroyed = true;
            await teardown(await teardownLogic);
        });
    }

    /**
     * Join multiple registrations into one
     *
     * @param registrations
     * @returns one registration that will be destroyed when this one is destroyed
     */
    public static join(
        ...registrations: Array<Promisable<IDestroyable>>
    ): Registration {
        return new Registration(() =>
            Promise.all(
                registrations.map(async (registrationPromise) => {
                    const registration = await registrationPromise;
                    if (registration) {
                        return await registration.destroy();
                    }
                }),
            ).then(),
        );
    }

    public static loop(
        optionsOrTick: ITick | { tick: ITick; waiter: IWaiter },
    ): Registration {
        let tick: ITick;
        let waiter: IWaiter;

        if (typeof optionsOrTick === 'function') {
            tick = optionsOrTick;
            waiter = () => Promise.resolve();
        } else {
            tick = optionsOrTick.tick;
            waiter = optionsOrTick.waiter;
        }

        return Registration.create(async ({ isDestroyed }) => {
            while (true) {
                await waiter();
                if (isDestroyed()) {
                    return;
                }
                await tick();
            }
        });
    }

    /**
     * Create registration from a subscription
     *
     * @param subscriptionFactory - function that will create subscription
     * @returns registration that when destroyed will unsubscribe from the subscription
     */
    public static fromSubscription(
        subscriptionFactory: (
            registerAdditionalSubscription: (
                additionalSubscription: Promisable<ISubscription>,
            ) => void,
        ) => Promisable<ISubscription>,
    ): Registration {
        return Registration.create(async () => {
            const subscriptions: ISubscription[] = [];

            const newSubscription = await subscriptionFactory(
                async (additionalSubscription) =>
                    subscriptions.push(await additionalSubscription),
            );
            subscriptions.push(newSubscription);

            // TODO: Do I for this need to import whole Subscription from RxJS
            return new Registration(() => {
                for (const subscription of subscriptions) {
                    subscription.unsubscribe();
                }
            });
        });
    }

    /**
     * Creates a registration that is empty and has nothing to destroy
     * Note: This is useful for implementing null object pattern
     */
    public static void() {
        return new this(() => {});
    }

    /**
     *
     * TODO: Use in all places where manually setting up the listeners
     */
    public static createEventListener<TEvent extends Event>({
        element,
        type,
        listener,
        options,
    }: {
        element: HTMLElement | Document;
        type: string;
        listener: (event: TEvent) => any;
        options?: boolean | AddEventListenerOptions;
    }): Registration {
        return Registration.create(() => {
            element.addEventListener(
                type,
                (event) => {
                    listener(event as TEvent);
                },
                options,
            );

            return () => {
                element.removeEventListener(
                    type,
                    listener as any,
                    options /* TODO: Should I pass here options? */,
                );
            };
        });
    }

    constructor(private teardownLogic: ITeardownLogic) {
        super();
    }

    public async destroy() {
        await super.destroy();
        await teardown(this.teardownLogic);
    }
}


/*

class ChildRegistration extends Registration {

}

const a:ChildRegistration = ChildRegistration.void();

*/

/**
 * TODO: Unite Registration and Destroyable
 * TODO: Maybe create some Registration.create helper for MobX observe/intercept
 */