import { Destroyable } from './Destroyable';
import { IAwaitable } from './IAwaitable';
import { IDestroyable } from './IDestroyable';

/**
 * @collboard-modules-sdk
 */
export interface IQueueOptions {
    /**
     * Key does not effect queue behaviour, it solves only for identification purposes.
     */
    key?: any;
    throttler: () => Promise<void>;
}

/**
 * Queue manages tasks running in queue and ensures that every task run (function run) run one after another and not mixed up
 *
 * TODO: error handling
 * TODO: maybe debouncing
 * TODO: timeouts
 *
 * @collboard-modules-sdk
 */
export class Queue<T> extends Destroyable implements IDestroyable {
    private runner: () => IAwaitable<T>;
    private throttles: Array<Promise<void>> = [];
    private result: Promise<T> | null = null;

    constructor(private options: IQueueOptions) {
        super();
    }

    public async task(runner: () => IAwaitable<T>): Promise<T> {
        this.runner = runner;
        this.throttles.push(this.options.throttler());

        if (!this.result) {
            this.result = new Promise(async (resolve) => {
                let throttlesLength = -1;
                while (throttlesLength !== this.throttles.length) {
                    throttlesLength = this.throttles.length;
                    await Promise.all(this.throttles);
                }

                this.result = null;
                this.throttles = [];

                if (this.destroyed) {
                    // TODO: Maybe destroy queue more elegantly
                    return;
                }
                resolve(this.runner());
            });
        }

        return this.result;
    }

    public async destroy() {
        await super.destroy();
    }
}
