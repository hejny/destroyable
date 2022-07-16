import { registerPairsInObject } from '../src/registerPairsInObject';

describe('how registering items in record objects works', () => {
    it('add items', () => {
        const base: Record<string, number> = {};
        registerPairsInObject({ base, add: { a: 1 } });
        registerPairsInObject({ base, add: { b: 2, c: 3 } });
        registerPairsInObject({ base, add: { d: 4, e: 5, f: 6 } });
        expect(base).toEqual({ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 });
    });

    it('add and remove items', async () => {
        const base: Record<string, number> = {};
        const registration1 = registerPairsInObject({ base, add: { a: 1 } });
        const registration2 = registerPairsInObject({
            base,
            add: { b: 2, c: 3 },
        });
        const registration3 = registerPairsInObject({
            base,
            add: { d: 4, e: 5, f: 6 },
        });
        expect(base).toEqual({ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 });
        await registration2.destroy();
        expect(base).toEqual({ a: 1, d: 4, e: 5, f: 6 });
        await registration3.destroy();
        expect(base).toEqual({ a: 1 });
        await registration1.destroy();
        expect(base).toEqual({});
        expect.assertions(4);
    });

    it('thow when the array is corrupted in the process', () => {
        const base: Record<string, number> = {};
        const registration = registerPairsInObject({
            base,
            add: { a: 1, b: 2, c: 3 },
        });
        expect(base).toEqual({ a: 1, b: 2, c: 3 });
        /*Corrupting the record*/ delete base.b;
        expect(registration.destroy()).rejects.toThrowError();
    });

    it('thow when removing twice', () => {
        const base: Record<string, number> = {};
        const registration = registerPairsInObject({
            base,
            add: { a: 1, b: 2, c: 3 },
        });
        expect(base).toEqual({ a: 1, b: 2, c: 3 });
        expect(registration.destroy()).resolves.not.toThrowError();
        expect(registration.destroy()).rejects.toThrowError();
    });

    it('add throw error on duplicate items', () => {
        const base: Record<string, number> = {};
        expect(() =>
            registerPairsInObject({ base, add: { a: 1 } }),
        ).not.toThrowError();
        expect(() =>
            registerPairsInObject({ base, add: { a: 1 } }),
        ).toThrowError();
        expect(() =>
            registerPairsInObject({ base, add: { b: 2 } }),
        ).not.toThrowError();
        expect(() =>
            registerPairsInObject({ base, add: { a: 1, b: 2 } }),
        ).toThrowError();
    });

    it('add skip duplicate items', async () => {
        const base: Record<string, number> = {};
        const registration = registerPairsInObject({ base, add: { a: 1 } });
        expect(() =>
            registerPairsInObject({
                base,
                add: { a: 1 },
                collisionStrategy: 'SKIP',
            }),
        ).not.toThrowError();
        expect(() =>
            registerPairsInObject({
                base,
                add: { a: 1 },
                collisionStrategy: 'SKIP',
            }),
        ).not.toThrowError();
        await registration.destroy();
        expect(base).toEqual({});
        expect.assertions(3);
    });

    it('add skip duplicate items and do not remove them', async () => {
        const base: Record<string, number> = {};
        const registration = registerPairsInObject({ base, add: { a: 1 } });
        const registrationWhichHasNoMeaning = registerPairsInObject({
            base,
            add: { a: 1 },
            collisionStrategy: 'SKIP',
        });
        expect(base).toEqual({ a: 1 });
        await registrationWhichHasNoMeaning.destroy();
        expect(base).toEqual({ a: 1 });
        await registration.destroy();
        expect(base).toEqual({});
        expect.assertions(3);
    });

    it('add skip duplicate items and do not crash when not removing them', async () => {
        const base: Record<string, number> = {};
        const registration = registerPairsInObject({ base, add: { a: 1 } });
        const registrationWhichHasNoMeaning = registerPairsInObject({
            base,
            add: { a: 1 },
            collisionStrategy: 'SKIP',
        });
        expect(base).toEqual({ a: 1 });
        await registration.destroy();
        expect(base).toEqual({});
        /* This command will do nothing but I expecrt here to not crash*/ await registrationWhichHasNoMeaning.destroy();
        expect(base).toEqual({});
        expect.assertions(3);
    });

    it('add override duplicate items and put value back when destoryed', async () => {
        const base: Record<string, number> = {};
        const registration1 = registerPairsInObject({ base, add: { a: 1 } });
        const registration2 = registerPairsInObject({
            base,
            add: { a: 2 },
            collisionStrategy: 'OVERRIDE',
        });
        const registration3 = registerPairsInObject({
            base,
            add: { a: 3 },
            collisionStrategy: 'OVERRIDE',
        });
        expect(base).toEqual({ a: 3 });
        await registration3.destroy();
        expect(base).toEqual({ a: 2 });
        await registration2.destroy();
        expect(base).toEqual({ a: 1 });
        await registration1.destroy();
        expect(base).toEqual({});
        expect.assertions(4);
    });
});
