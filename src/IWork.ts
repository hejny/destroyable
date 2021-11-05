import { Promisable } from "type-fest";


export type IWork = () => Promisable<void>;
export type ITick = IWork;
export type IWaiter = IWork;
