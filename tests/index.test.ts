import { describe, expect, it, mock, test, type Mock } from "bun:test";
import { TestClass, type ITestInterface } from "..";

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

describe("TestClass - Mocking", () => {
  test("mocked properties preserve their signature and can use mock methods", () => {
    const mockedClass = mockFn<TestClass>();

    mockedClass.name.mockReturnValue("Mocked John");

    expect(mockedClass.name()).toBe("Mocked John");
  });

  test("mocked getters preserve their signature and can use mock methods", () => {
    const mockedClass = mockFn<TestClass>();

    mockedClass.fullname.mockReturnValue("Mocked Full Name");

    expect(mockedClass.fullname()).toBe("Mocked Full Name");
  });

  test("mocked methods preserve their signature and can use mock methods", () => {
    const mockedClass = mockFn<TestClass>();

    mockedClass.nickName.mockReturnValue("Mocked Full Name");

    expect(mockedClass.nickName()).toBe("Mocked Full Name");
  });

  test("mocked async methods preserve their signature, can use mock methods and return resolved values", () => {
    const mockedClass = mockFn<TestClass>();

    mockedClass.asyncMethod.mockResolvedValue("Async Full Name");

    // The object passed is just to signal the type of Promise to be returned (resolved in this case)
    expect(mockedClass.asyncMethod({ error: false })).resolves.toBe(
      "Async Full Name"
    );
  });

  test("mocked async methods preserve their signature, can use mock methods and return rejected values", () => {
    const mockedClass = mockFn<TestClass>();

    mockedClass.asyncMethod.mockRejectedValue(new Error("Async Error"));

    // The object passed is just to signal the type of Promise to be returned (rejected in this case)
    expect(mockedClass.asyncMethod({ error: true })).rejects.toThrow(
      "Async Error"
    );
  });
});

describe("ITestInterface - Mocking", () => {
  it("should set own properties as mock functions with proper mock methods", () => {
    const mockedClass = mockFn<ITestInterface>();

    mockedClass.name.mockReturnValue("Mocked John");
    mockedClass.lastName.mockReturnValue("Mocked Doe");
    mockedClass.nickName.mockReturnValue("Mocked John Doe");
    mockedClass.asyncMethod.mockResolvedValueOnce("Async Full Name");
    mockedClass.asyncMethod.mockRejectedValueOnce(new Error("Async Error"));

    expect(mockedClass.name()).toBe("Mocked John");
    expect(mockedClass.lastName()).toBe("Mocked Doe");
    expect(mockedClass.nickName()).toBe("Mocked John Doe");
    expect(mockedClass.asyncMethod({ error: false })).resolves.toBe(
      "Async Full Name"
    );
    expect(mockedClass.asyncMethod({ error: true })).rejects.toThrow(
      "Async Error"
    );
  });
});
