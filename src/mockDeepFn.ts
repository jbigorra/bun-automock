import { type Mock, mock } from "bun:test";
import type { DeepMockProxy } from "./types";

export const mockDeepFn = <T extends object>(): DeepMockProxy<T> => {
  const createDeepMock = <U extends object>(): DeepMockProxy<U> => {
    // biome-ignore lint/suspicious/noExplicitAny: required as it is automocking
    const mocks = new Map<string | symbol, any>();

    return new Proxy({} as DeepMockProxy<U>, {
      get: (_target, prop) => {
        if (!mocks.has(prop)) {
          const hybridMock = createHybridMock();
          mocks.set(prop, hybridMock);
        }
        return mocks.get(prop);
      }
    });
  };

  const createHybridMock = () => {
    const regularMock = mock();
    const deepMock = createDeepMock();

    return new Proxy(regularMock, {
      get: (target, prop) => {
        // If accessing mock methods, return bound methods to preserve 'this' context
        if (typeof prop === "string" && prop.startsWith("mock")) {
          // biome-ignore lint/suspicious/noExplicitAny: required as it is automocking
          const method = target[prop as keyof Mock<any>];
          // Bind the method to the original mock to preserve 'this' context
          return typeof method === "function" ? method.bind(target) : method;
        }

        // Add spy() method to access the underlying mock for test assertions
        if (prop === "spy") {
          return () => target;
        }

        // For other properties, use the deep mock
        // biome-ignore lint/suspicious/noExplicitAny: required as it is automocking
        return (deepMock as any)[prop];
      },

      apply: (target, _thisArg, args) => {
        // When called as a function, use the regular mock with proper context
        return target.apply(target, args); // Use target as thisArg to maintain mock context
      }
    });
  };

  return createDeepMock<T>();
};
