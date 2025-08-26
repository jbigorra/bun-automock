import { type Mock, mock } from "bun:test";
import type { MockInstance } from "./types";

export const mockFn = <T extends object>(): MockInstance<T> => {
  const mocks = new Map<string | symbol, Mock<any>>();

  return new Proxy({} as MockInstance<T>, {
    get: (_, prop) => {
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
          },
        });

        mocks.set(prop, mockWithSpy);
      }
      return mocks.get(prop);
    },
  });
};
