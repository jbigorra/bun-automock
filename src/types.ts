import type { Mock } from "bun:test";

export type MockInstance<T> = {
  // For functions, preserve signature
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? Mock<(...args: A) => R>
    : // For objects, recursively mock their properties but also make them callable as mock functions
    T[K] extends object
    ? MockInstance<T[K]> & Mock<() => T[K]>
    : Mock<() => T[K]>;
};
