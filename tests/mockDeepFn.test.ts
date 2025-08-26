import { describe, expect, test } from "bun:test";
import { mockDeepFn } from "../src/mockDeepFn";
import { TestClass } from "./fixtures";

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
    mockedClass.firstNestedClass.secondNestedClass.testMethod.mockReturnValue(
      () => 2
    );
    mockedClass.firstNestedClass.secondNestedClass.testAsyncMethod.mockResolvedValueOnce(
      2
    );
    mockedClass.firstNestedClass.secondNestedClass.testAsyncMethod.mockRejectedValueOnce(
      new Error("Async Error")
    );

    // caveat: nested literal objects are not mocked, and we need to call the method to get the mock value in the assertions
    expect(mockedClass.firstNestedClass.secondNestedClass.testObject()).toEqual(
      {
        test1: "test1",
        test2: 2,
        test3: [3],
      }
    );
    // caveat: getters returning a literal object are expected to be called to get the mock value in the assertions
    expect(mockedClass.firstNestedClass.secondNestedClass.testGetter()).toEqual(
      {
        test: "test1",
        test2: "2",
        test3: "test3",
      }
    );
    expect(mockedClass.firstNestedClass.secondNestedClass.testMethod()()).toBe(
      2
    );
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
