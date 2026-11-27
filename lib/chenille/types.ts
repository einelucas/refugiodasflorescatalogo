export type Point = { x: number; y: number };
export type FlowerKind = "rosa" | "girassol" | "tulipa" | "lirio" | "margarida" | "gerbera";
export type Thread = { points: Point[]; color: string; thickness: number; shadow?: string; seed?: number };
export type Flower = { petals: Thread[]; center: Thread[]; stem: Thread[]; leaves: Thread[] };
export type ThreadProgress = { start?: number; end?: number };
