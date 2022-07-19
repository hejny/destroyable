import { observable, toJS } from 'mobx';
import { registerItemsInArray } from '../src/registerItemsInArray';

describe('how registering items in array works', () => {
    it('add items', () => {
        const base: number[] = [];
        registerItemsInArray({ base, add: [1] });
        registerItemsInArray({ base, add: [2, 3] });
        registerItemsInArray({ base, add: [4, 5, 6] });
        expect(base).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('add and remove items', async () => {
        const base: number[] = [];
        const registration1 = registerItemsInArray({ base, add: [1] });
        const registration2 = registerItemsInArray({ base, add: [2, 3] });
        const registration3 = registerItemsInArray({ base, add: [4, 5, 6] });
        expect(base).toEqual([1, 2, 3, 4, 5, 6]);
        await registration2.destroy();
        expect(base).toEqual([1, 4, 5, 6]);
        await registration3.destroy();
        expect(base).toEqual([1]);
        await registration1.destroy();
        expect(base).toEqual([]);
        expect.assertions(4);
    });

    it('add and remove items  with mobxjs observable array', async () => {
        const base: number[] = observable([]);
        const registration1 = registerItemsInArray({ base, add: [1] });
        const registration2 = registerItemsInArray({ base, add: [2, 3] });
        const registration3 = registerItemsInArray({ base, add: [4, 5, 6] });
        expect(base).toEqual([1, 2, 3, 4, 5, 6]);
        await registration2.destroy();
        expect(base).toEqual([1, 4, 5, 6]);
        await registration3.destroy();
        expect(base).toEqual([1]);
        await registration1.destroy();
        expect(base).toEqual([]);
        expect.assertions(4);
    });

    it('add and remove items with mobxjs observable array and sophisticated compare', async () => {
        const base: Array<{ value: number }> = observable([]);
        const compare = (a: { value: number }, b: { value: number }) =>
            a.value === b.value;
        const registration1 = registerItemsInArray({
            base,
            compare,
            add: [{ value: 1 }],
        });
        const registration2 = registerItemsInArray({
            base,
            compare,
            add: [{ value: 2 }, { value: 3 }],
        });
        const registration3 = registerItemsInArray({
            base,
            compare,
            add: [{ value: 4 }, { value: 5 }, { value: 6 }],
        });
        expect(toJS(base)).toEqual([
            { value: 1 },
            { value: 2 },
            { value: 3 },
            { value: 4 },
            { value: 5 },
            { value: 6 },
        ]);
        await registration2.destroy();
        expect(toJS(base)).toEqual([
            { value: 1 },
            { value: 4 },
            { value: 5 },
            { value: 6 },
        ]);
        await registration3.destroy();
        expect(toJS(base)).toEqual([{ value: 1 }]);
        await registration1.destroy();
        expect(toJS(base)).toEqual([]);
        expect.assertions(4);
    });

    it('thow when the array is corrupted in the process', () => {
        const base: number[] = [];
        const registration = registerItemsInArray({ base, add: [1, 2, 3] });
        expect(base).toEqual([1, 2, 3]);
        /*Corrupting the array*/ base.splice(1, 1);
        expect(registration.destroy()).rejects.toThrowError();
    });

    it('thow when removing twice', () => {
        const base: number[] = [];
        const registration = registerItemsInArray({ base, add: [1, 2, 3] });
        expect(base).toEqual([1, 2, 3]);
        expect(registration.destroy()).resolves.not.toThrowError();
        expect(registration.destroy()).rejects.toThrowError();
    });

    /*
    TODO:
    it('add throw error on duplicate items', () => {});
    */

    /*
    TODO:
    it('add ignore duplicate items', () => {});

    it('add override duplicate items', () => {});
    */
});
