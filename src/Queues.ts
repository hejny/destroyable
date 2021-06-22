import { Destroyable } from './Destroyable';
import { IDestroyable } from './IDestroyable';
import { IQueueOptions, Queue } from './Queue';

/**
 * @collboard-modules-sdk
 */
export class Queues<K, V> extends Destroyable implements IDestroyable {
    private queues = new Map<K, Queue<V>>();

    constructor(private options: Omit<IQueueOptions, 'key'>) {
        super();
    }

    getQueue(key: K): Queue<V> {
        const existingQueue = this.queues.get(key);
        if (existingQueue) {
            return existingQueue;
        } else {
            const newQueue = new Queue<V>({ key, ...this.options });
            this.queues.set(key, newQueue);
            return newQueue;
        }
    }

    public async destroy() {
        await super.destroy();
        for (const queue of Object.values(this.queues)) {
            await queue.destroy();
        }
    }
}

// TODO: This can be probbably more universal
