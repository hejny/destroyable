import { Destroyable } from './Destroyable';
import { IAwaitable } from './IAwaitable';
import { IDestroyable } from './IDestroyable';
import { ISubscription } from './ISubscription';
import { ITeardownLogic, teardown } from './TeardownLogic';

/**
 * This object will be returned by register functions to unregister things
 * TODO: Unite Registration and Destroyable
 * TODO: Maybe create some Registration.create helper for MobX observe/intercept
 *
 * @collboard-modules-sdk
 */
export class Registration extends Destroyable implements IDestroyable {
    /**
     *
     * TODO: Use in all places where manually setting up  pair things
     */
    public static create(
        creator: () => IAwaitable<ITeardownLogic>,
    ): Registration {
        const teardownLogic = creator();
        return new Registration(async () => {
            await teardown(await teardownLogic);
        });
    }

    public static join(
        ...registrations: Array<IAwaitable<IDestroyable | undefined>>
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

    public static fromSubscription(
        subscriptionFactory: (
            registerAdditionalSubscription: (
                additionalSubscription: IAwaitable<ISubscription>,
            ) => void,
        ) => IAwaitable<ISubscription>,
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

    public static void(): Registration {
        return new Registration(() => {});
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

    constructor(
        private teardownLogic: (() => IAwaitable<void>) | IDestroyable,
    ) {
        super();
    }

    public async destroy() {
        await super.destroy();
        await teardown(this.teardownLogic);
    }
}
