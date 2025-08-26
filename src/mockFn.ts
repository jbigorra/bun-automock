import { type Mock, mock } from "bun:test";
import type { MockInstance } from "./types";

export const mockFn = <T extends object>(): MockInstance<T> => {
  const mocks = new Map<string | symbol, Mock<any>>();

  return new Proxy({} as MockInstance<T>, {
    get: (_, prop) => {
      if (!mocks.has(prop)) {
        mocks.set(prop, mock());
      }
      return mocks.get(prop);
    },
  });
};
