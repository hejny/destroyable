import { forImmediate, forTime } from 'waitasecond';
import { Queue } from '../src/Queue';

let _lock = false;
function createTaskThatCanRunOnlyOneAtMomentGlobally(i: number) {
    return async () => {
        if (_lock) throw new Error(`Running more than one task! Test should fail!`);
        _lock = true;
        forTime(i);
        _lock = false;
        return i;
    };
}

function createTaskThatShouldBeExecutedMaxOnce(i: number) {
    let _runned = false;
    return async () => {
        if (_runned) throw new Error(`Running task more than once! Test should fail!`);
        _runned = true;
        forTime(i);
        return i;
    };
}

function createTaskThatShouldNotBeExecuted(): () => never {
    return () => {
        throw new Error(`This should not be executed! Test should fail!`);
    };
}

describe('how Queue works', () => {
    it('will run one task at a time ', async () => {
        const queue = new Queue({ throttler: forImmediate });
        expect(await queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(1))).toBe(1);
        expect(await queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(2))).toBe(2);
        expect(await queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(3))).toBe(3);
    });

    it('will run last task and fullfill previous runs with last result', async () => {
        const queue = new Queue({ throttler: forImmediate });
        await Promise.all([
            expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(1))).resolves.toBe(3),
            expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(2))).resolves.toBe(3),
            expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(3))).resolves.toBe(3),
        ]);
    });

    it('will run two blocks as two', async () => {
        const queue = new Queue({ throttler: forTime.bind(null, 20) });

        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(1))).resolves.toBe(3);
        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(2))).resolves.toBe(3);
        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(3))).resolves.toBe(3);

        await forTime(100);

        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(4))).resolves.toBe(6);
        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(5))).resolves.toBe(6);
        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(6))).resolves.toBe(6);

        await forTime(20 + 6 /* To every expect fullfill or reject */);

        expect.assertions(3 + 3);
    });

    it('will run two promise blocks as two', async () => {
        const queue = new Queue({ throttler: forTime.bind(null, 20) });

        await Promise.all([
            expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(1))).resolves.toBe(3),
            expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(2))).resolves.toBe(3),
            expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(3))).resolves.toBe(3),
        ]);
        await forTime(100);
        await Promise.all([
            expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(4))).resolves.toBe(6),
            expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(5))).resolves.toBe(6),
            expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(6))).resolves.toBe(6),
        ]);
        expect.assertions(3 + 3);
    });

    it('will run two blocks as one', async () => {
        const queue = new Queue({ throttler: forTime.bind(null, 20) });

        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(1))).resolves.toBe(6);
        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(2))).resolves.toBe(6);
        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(3))).resolves.toBe(6);

        await forTime(10);

        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(4))).resolves.toBe(6);
        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(5))).resolves.toBe(6);
        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(6))).resolves.toBe(6);

        await forTime(20 + 6 /* To every expect fullfill or reject */);

        expect.assertions(3 + 3);
    });

    it('will run multiple blocks as one with snoozing of throttler', async () => {
        const queue = new Queue({ throttler: forTime.bind(null, 20) });

        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(1))).resolves.toBe(15);
        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(2))).resolves.toBe(15);
        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(3))).resolves.toBe(15);

        await forTime(15);

        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(4))).resolves.toBe(15);
        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(5))).resolves.toBe(15);
        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(6))).resolves.toBe(15);

        await forTime(15);

        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(7))).resolves.toBe(15);
        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(8))).resolves.toBe(15);
        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(9))).resolves.toBe(15);

        await forTime(15);

        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(10))).resolves.toBe(15);
        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(11))).resolves.toBe(15);
        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(12))).resolves.toBe(15);

        await forTime(15);

        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(13))).resolves.toBe(15);
        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(14))).resolves.toBe(15);
        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(15))).resolves.toBe(15);

        await forTime(20);

        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(16))).resolves.toBe(18);
        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(17))).resolves.toBe(18);
        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(18))).resolves.toBe(18);

        await forTime(20 + 18 /* To every expect fullfill or reject */);

        expect.assertions(3 * 6);
    });

    it('will not call first task runners', async () => {
        const queue = new Queue({ throttler: forTime.bind(null, 20) });

        expect(queue.task(createTaskThatShouldNotBeExecuted())).resolves.toBe(1);
        expect(queue.task(createTaskThatShouldNotBeExecuted())).resolves.toBe(1);
        expect(queue.task(createTaskThatShouldNotBeExecuted())).resolves.toBe(1);

        await forTime(10);

        expect(queue.task(createTaskThatShouldNotBeExecuted())).resolves.toBe(1);
        expect(queue.task(createTaskThatShouldNotBeExecuted())).resolves.toBe(1);
        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(1))).resolves.toBe(1);

        await forTime(100);

        expect(queue.task(createTaskThatShouldNotBeExecuted())).resolves.toBe(2);
        expect(queue.task(createTaskThatShouldNotBeExecuted())).resolves.toBe(2);
        expect(queue.task(createTaskThatCanRunOnlyOneAtMomentGlobally(2))).resolves.toBe(2);

        await forTime(20 + 2 /* To every expect fullfill or reject */);

        // TODO: !! Why sometimes tests fails and sometimes passes on this??
        expect.assertions(3 * 3);
    });

    it('will not call any task multiple times', async () => {
        const queue = new Queue({ throttler: forImmediate });
        await Promise.all([
            expect(queue.task(createTaskThatShouldBeExecutedMaxOnce(1))).resolves.toBe(9),
            expect(queue.task(createTaskThatShouldBeExecutedMaxOnce(2))).resolves.toBe(9),
            expect(queue.task(createTaskThatShouldBeExecutedMaxOnce(3))).resolves.toBe(9),
            expect(queue.task(createTaskThatShouldBeExecutedMaxOnce(4))).resolves.toBe(9),
            expect(queue.task(createTaskThatShouldBeExecutedMaxOnce(5))).resolves.toBe(9),
            expect(queue.task(createTaskThatShouldBeExecutedMaxOnce(6))).resolves.toBe(9),
            expect(queue.task(createTaskThatShouldBeExecutedMaxOnce(7))).resolves.toBe(9),
            expect(queue.task(createTaskThatShouldBeExecutedMaxOnce(8))).resolves.toBe(9),
            expect(queue.task(createTaskThatShouldBeExecutedMaxOnce(9))).resolves.toBe(9),
        ]);
    });

    it('will not call any task multiple times with some interuptions', async () => {
        const queue = new Queue({ throttler: forTime.bind(null, 50) });

        expect(queue.task(createTaskThatShouldBeExecutedMaxOnce(1))).resolves.toBe(9);
        expect(queue.task(createTaskThatShouldBeExecutedMaxOnce(2))).resolves.toBe(9);
        expect(queue.task(createTaskThatShouldBeExecutedMaxOnce(3))).resolves.toBe(9);

        await forTime(10);

        expect(queue.task(createTaskThatShouldBeExecutedMaxOnce(4))).resolves.toBe(9);
        expect(queue.task(createTaskThatShouldBeExecutedMaxOnce(5))).resolves.toBe(9);
        expect(queue.task(createTaskThatShouldBeExecutedMaxOnce(6))).resolves.toBe(9);

        await forTime(10);

        expect(queue.task(createTaskThatShouldBeExecutedMaxOnce(7))).resolves.toBe(9);
        expect(queue.task(createTaskThatShouldBeExecutedMaxOnce(8))).resolves.toBe(9);
        expect(queue.task(createTaskThatShouldBeExecutedMaxOnce(9))).resolves.toBe(9);

        await forTime(50 + 9 /* To every expect fullfill or reject */);

        expect.assertions(3 * 3);
    });
});

// @roseckyj 🍍 Please overlook how are async tests constructed
