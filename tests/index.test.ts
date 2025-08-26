import { describe, expect, it, mock, type Mock } from "bun:test";
import { TestClass } from "..";

// Create a mapped type that transforms all properties to mocks
type MockedClass<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? Mock<(...args: A) => R> // For functions, preserve signature
    : Mock<() => T[K]>; // For properties, return the property type
};

const mockFn = <T extends object>(): MockedClass<T> => {
  const mocks = new Map<string | symbol, Mock<any>>();

  return new Proxy({} as MockedClass<T>, {
    get: (target, prop) => {
      if (!mocks.has(prop)) {
        mocks.set(prop, mock());
      }
      return mocks.get(prop);
    },
  });
};

describe("Person", () => {
  it("should set own properties as mock functions with proper mock methods", () => {
    const mockedClass = mockFn<TestClass>();

    // Properties can use mock methods and return the correct type
    mockedClass.name.mockReturnValue("Mocked John");

    // Methods preserve their signature and can use mock methods
    mockedClass.fullname.mockReturnValue("Mocked Full Name");

    // Test that they work
    expect(mockedClass.name()).toBe("Mocked John");
    expect(mockedClass.fullname()).toBe("Mocked Full Name");

    // Verify mock methods are available
    expect(mockedClass.name.mockReturnValue).toBeDefined();
    expect(mockedClass.fullname.mockReturnValue).toBeDefined();
  });

  it("should support successful async mock methods", () => {
    const mockedClass = mockFn<TestClass>();

    mockedClass.asyncMethodSuccess.mockResolvedValue("Async Full Name");

    expect(mockedClass.asyncMethodSuccess()).resolves.toBe("Async Full Name");
  });

  it("should support error async mock methods", () => {
    const mockedClass = mockFn<TestClass>();

    mockedClass.asyncMethodError.mockRejectedValue(new Error("Async Error"));

    expect(mockedClass.asyncMethodError()).rejects.toThrow("Async Error");
  });
});
