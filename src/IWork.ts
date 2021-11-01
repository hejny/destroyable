import { IAwaitable } from '.';

export type IWork = () => IAwaitable<void>;
export type ITick = IWork;
export type IWaiter = IWork;
