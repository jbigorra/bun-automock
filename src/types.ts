import type { Mock } from "bun:test";

interface MockWithSpy<A extends any[], R> extends Mock<(...args: A) => R> {
  spy(): Mock<(...args: A) => R>;
}
type _MockProxy<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R ? T[K] & MockWithSpy<A, R> : T[K];
};
type MockProxy<T> = _MockProxy<T> & T;
type _DeepMockProxy<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R ? T[K] & MockWithSpy<A, R> : T[K] & _DeepMockProxy<T[K]>;
};
type DeepMockProxy<T> = _DeepMockProxy<T> & T;

export type { DeepMockProxy, MockProxy };
