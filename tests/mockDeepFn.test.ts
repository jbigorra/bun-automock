import { describe, expect, test } from "bun:test";
import { mockDeepFn } from "../src/mockDeepFn";
import { TestClass } from "./fixtures";

describe("mockDeepFn", () => {
  test("first level nested objects should be automatically mocked", () => {
    const mockedClass = mockDeepFn<TestClass>();

    mockedClass.firstNestedClass.testNumber.mockReturnValue(1);
    mockedClass.firstNestedClass.testGetter.mockReturnValue(2);
    mockedClass.firstNestedClass.testMethod.mockReturnValue(undefined);
    mockedClass.firstNestedClass.testAsyncMethod.mockResolvedValueOnce(undefined);
    mockedClass.firstNestedClass.testAsyncMethod.mockRejectedValueOnce(new Error("Async Error"));

    expect(mockedClass.firstNestedClass.testNumber()).toBe(1);
    expect(mockedClass.firstNestedClass.testGetter()).toBe(2);
    expect(mockedClass.firstNestedClass.testMethod()).toBe(undefined);
    expect(mockedClass.firstNestedClass.testAsyncMethod({ error: false })).resolves.toBe(undefined);
    expect(mockedClass.firstNestedClass.testAsyncMethod({ error: true })).rejects.toThrow("Async Error");
  });

  test("spy() method should work for first level nested objects", () => {
    const mockedClass = mockDeepFn<TestClass>();

    mockedClass.firstNestedClass.testNumber.mockReturnValue(42);

    const result = mockedClass.firstNestedClass.testNumber();

    // Test the new .spy() method
    expect(mockedClass.firstNestedClass.testNumber.spy()).toHaveBeenCalledTimes(1);
    expect(result).toBe(42);
  });

  test("second level nested objects should be automatically mocked", () => {
    const mockedClass = mockDeepFn<TestClass>();

    mockedClass.firstNestedClass.secondNestedClass.testObject.mockReturnValue({
      test1: "test1",
      test2: 2,
      test3: [3],
    });
    mockedClass.firstNestedClass.secondNestedClass.testGetter.mockReturnValue({
      test: "test1",
      test2: "2",
      test3: "test3",
    });
    mockedClass.firstNestedClass.secondNestedClass.testMethod.mockReturnValue(() => 2);
    mockedClass.firstNestedClass.secondNestedClass.testAsyncMethod.mockResolvedValueOnce(2);
    mockedClass.firstNestedClass.secondNestedClass.testAsyncMethod.mockRejectedValueOnce(new Error("Async Error"));

    // caveat: nested literal objects are not mocked, and we need to call the method to get the mock value in the assertions
    expect(mockedClass.firstNestedClass.secondNestedClass.testObject()).toEqual({
      test1: "test1",
      test2: 2,
      test3: [3],
    });
    // caveat: getters returning a literal object are expected to be called to get the mock value in the assertions
    expect(mockedClass.firstNestedClass.secondNestedClass.testGetter()).toEqual({
      test: "test1",
      test2: "2",
      test3: "test3",
    });
    expect(mockedClass.firstNestedClass.secondNestedClass.testMethod()()).toBe(2);
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
  });
});

describe("mockDeepFn with complex types", () => {
  interface User {
    id: string;
    name: string;
  }

  interface DatabaseService {
    users: {
      repository: {
        findById(id: string): Promise<User>;
        save(user: User): Promise<void>;
      };
      cache: {
        get(key: string): string | null;
        set(key: string, value: string): void;
      };
    };
  }
  test("deep nested objects should be automatically mocked", async () => {
    const mockedClass = mockDeepFn<DatabaseService>();

    mockedClass.users.repository.findById.mockResolvedValueOnce({
      id: "1",
      name: "John",
    });

    mockedClass.users.repository.findById.mockResolvedValueOnce({
      id: "2",
      name: "Jane",
    });

    const result = await mockedClass.users.repository.findById("1");
    const result2 = await mockedClass.users.repository.findById("2");

    // Use the new .spy() method for cleaner test assertions
    expect(mockedClass.users.repository.findById.spy()).toHaveBeenCalledTimes(2);
    expect(mockedClass.users.repository.findById.spy()).toHaveBeenNthCalledWith(1, "1");
    expect(mockedClass.users.repository.findById.spy()).toHaveReturnedTimes(2);
    expect(mockedClass.users.repository.findById.spy()).toHaveBeenCalledWith("1");
    expect(mockedClass.users.repository.findById.spy()).toHaveBeenCalledWith("2");
    expect(result).toEqual({ id: "1", name: "John" });
    expect(result2).toEqual({ id: "2", name: "Jane" });
  });
});
