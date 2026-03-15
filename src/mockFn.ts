import { type Mock, mock } from "bun:test";
import type { MockFnWithSpy, MockProxy } from "./types";

export function mockFn(): MockFnWithSpy;
export function mockFn<T>(): MockProxy<T>;
export function mockFn<T>(): MockProxy<T> | MockFnWithSpy {
  const mocks = new Map<string | symbol, Mock<any>>();
  const selfMock = mock();

  // biome-ignore lint/suspicious/noExplicitAny: proxy target needs to be callable with arbitrary args
  const target = Object.assign((...args: any[]) => {}, {}) as any;

  return new Proxy(target, {
    get: (_, prop) => {
      if (prop === "spy") {
        return () => selfMock;
      }

      if (!mocks.has(prop)) {
        const regularMock = mock();

        // Create a proxy that adds the .spy() method
        const mockWithSpy = new Proxy(regularMock, {
          get: (target, spyProp) => {
            if (spyProp === "spy") {
              return () => target;
            }

            // For all other properties, return from the actual mock
            const value = target[spyProp as keyof Mock<any>];
            return typeof value === "function" ? value.bind(target) : value;
          },
          apply: (target, thisArg, args) => {
            return target.apply(target, args);
          }
        });

        mocks.set(prop, mockWithSpy);
      }
      return mocks.get(prop);
    },
    apply: (_target, _thisArg, args) => {
      return selfMock(...args);
    }
  });
}
