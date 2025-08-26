import { describe, expect, it, mock, test, type Mock } from "bun:test";
import { TestClass, type ITestInterface } from "..";

// Create a mapped type that transforms all properties to mocks
type MockedClass<T> = {
  // For functions, preserve signature
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? Mock<(...args: A) => R>
    : // For objects, recursively mock their properties and For properties, return the property type
    T[K] extends object
    ? MockedClass<T[K]>
    : Mock<() => T[K]>;
};

const mockFn = <T extends object>(): MockedClass<T> => {
  const mocks = new Map<string | symbol, Mock<any>>();

  return new Proxy({} as MockedClass<T>, {
    get: (_, prop) => {
      if (!mocks.has(prop)) {
        mocks.set(prop, mock());
      }
      return mocks.get(prop);
    },
  });
};

const mockDeepFn = <T extends object>(): MockedClass<T> => {
  const createDeepMock = <U extends object>(): MockedClass<U> => {
    const mocks = new Map<string | symbol, any>();

    return new Proxy({} as MockedClass<U>, {
      get: (target, prop) => {
        if (!mocks.has(prop)) {
          const hybridMock = createHybridMock();
          mocks.set(prop, hybridMock);
        }
        return mocks.get(prop);
      },
    });
  };

  const createHybridMock = () => {
    const regularMock = mock();
    const deepMock = createDeepMock();

    return new Proxy(regularMock, {
      get: (target, prop) => {
        // If accessing mock methods, return bound methods to preserve 'this' context
        if (typeof prop === "string" && prop.startsWith("mock")) {
          const method = target[prop as keyof Mock<any>];
          // Bind the method to the original mock to preserve 'this' context
          return typeof method === "function" ? method.bind(target) : method;
        }

        // For other properties, use the deep mock
        return deepMock[prop as any];
      },

      apply: (target, thisArg, args) => {
        // When called as a function, use the regular mock with proper context
        return target.apply(target, args); // Use target as thisArg to maintain mock context
      },
    });
  };

  return createDeepMock<T>();
};

describe("mockFn", () => {
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

describe("mockDeepFn", () => {
  test("first level nested objects should be automatically mocked", () => {
    const mockedClass = mockDeepFn<TestClass>();

    mockedClass.firstNestedClass.testNumber.mockReturnValue(1);
    mockedClass.firstNestedClass.testGetter.mockReturnValue(2);
    mockedClass.firstNestedClass.testMethod.mockReturnValue(undefined);
    mockedClass.firstNestedClass.testAsyncMethod.mockResolvedValueOnce(
      undefined
    );
    mockedClass.firstNestedClass.testAsyncMethod.mockRejectedValueOnce(
      new Error("Async Error")
    );

    expect(mockedClass.firstNestedClass.testNumber()).toBe(1);
    expect(mockedClass.firstNestedClass.testGetter()).toBe(2);
    expect(mockedClass.firstNestedClass.testMethod()).toBe(undefined);
    expect(
      mockedClass.firstNestedClass.testAsyncMethod({ error: false })
    ).resolves.toBe(undefined);
    expect(
      mockedClass.firstNestedClass.testAsyncMethod({ error: true })
    ).rejects.toThrow("Async Error");
  });

  test.todo(
    "second level nested objects should be automatically mocked",
    () => {
      const mockedClass = mockDeepFn<TestClass>();

      mockedClass.firstNestedClass.secondNestedClass.testObject.mockReturnValue(
        {
          test1: "test1",
          test2: 2,
          test3: [3],
        }
      );
      mockedClass.firstNestedClass.secondNestedClass.testGetter.mockReturnValue(
        {
          test: "test1",
          test2: "2",
          test3: "test3",
        }
      );
      mockedClass.firstNestedClass.secondNestedClass.testMethod.mockReturnValue(
        () => 2
      );
      mockedClass.firstNestedClass.secondNestedClass.testAsyncMethod.mockResolvedValueOnce(
        2
      );
      mockedClass.firstNestedClass.secondNestedClass.testAsyncMethod.mockRejectedValueOnce(
        new Error("Async Error")
      );

      expect(mockedClass.firstNestedClass.secondNestedClass.testObject).toEqual(
        {
          test1: "test1",
          test2: 2,
          test3: [3],
        }
      );
      expect(mockedClass.firstNestedClass.secondNestedClass.testGetter).toEqual(
        {
          test: "test1",
          test2: "2",
          test3: "test3",
        }
      );
      expect(
        mockedClass.firstNestedClass.secondNestedClass.testMethod()()
      ).toBe(2);
      expect(
        mockedClass.firstNestedClass.secondNestedClass.testAsyncMethod({
          error: false,
        })
      ).resolves.toBe(2);
      expect(
        mockedClass.firstNestedClass.secondNestedClass.testAsyncMethod({
          error: true,
        })
      ).rejects.toThrow("Async Error");
    }
  );
});
