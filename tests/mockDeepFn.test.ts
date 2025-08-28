import { describe, expect, test } from "bun:test";
import { mockDeepFn } from "../src/mockDeepFn";
import { TestClass } from "./fixtures";

describe("mockDeepFn", () => {
  test("first level nested object.method() should be mockable and return the pre-defined value", () => {
    const mockedClass = mockDeepFn<TestClass>();

    mockedClass.firstNestedClass.method.mockReturnValue(undefined);
    mockedClass.firstNestedClass.asyncMethod.mockResolvedValueOnce(undefined);
    mockedClass.firstNestedClass.asyncMethod.mockRejectedValueOnce(new Error("Async Error"));

    expect(mockedClass.firstNestedClass.method()).toBe(undefined);
    expect(mockedClass.firstNestedClass.asyncMethod({ error: false })).resolves.toBe(undefined);
    expect(mockedClass.firstNestedClass.asyncMethod({ error: true })).rejects.toThrow("Async Error");
  });

  test("spy() method should work for first level nested object.method()", async () => {
    const mockedClass = mockDeepFn<TestClass>();
    mockedClass.nickName.mockReturnValue("Mocked Johnny");
    mockedClass.asyncMethod.mockResolvedValueOnce("First Call - Mocked asyncMethod");
    mockedClass.asyncMethod.mockResolvedValueOnce("Second Call - Mocked asyncMethod");

    mockedClass.nickName();
    mockedClass.nickName();
    await mockedClass.asyncMethod({ error: false });
    await mockedClass.asyncMethod({ error: true });

    expect(mockedClass.nickName.spy()).toHaveBeenCalled();
    expect(mockedClass.nickName.spy()).toHaveBeenCalledTimes(2);
    expect(mockedClass.nickName.spy()).toHaveReturnedTimes(2);
    expect(mockedClass.asyncMethod.spy()).toHaveBeenCalledTimes(2);
    expect(mockedClass.asyncMethod.spy()).toHaveBeenNthCalledWith(1, { error: false });
    expect(mockedClass.asyncMethod.spy()).toHaveBeenNthCalledWith(2, { error: true });
    expect(mockedClass.asyncMethod.spy()).toHaveReturnedTimes(2);
  });

  test("second level nested object.method() should be mockable and return the pre-defined value", () => {
    const mockedClass = mockDeepFn<TestClass>();

    mockedClass.firstNestedClass.secondNestedClass.testMethod.mockReturnValue(() => 2);
    mockedClass.firstNestedClass.secondNestedClass.testAsyncMethod.mockResolvedValueOnce(2);
    mockedClass.firstNestedClass.secondNestedClass.testAsyncMethod.mockRejectedValueOnce(new Error("Async Error"));

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

  test("spy() method should work for second level nested object.method()", async () => {
    const mockedClass = mockDeepFn<TestClass>();
    mockedClass.firstNestedClass.secondNestedClass.testMethod.mockReturnValue(() => 2);
    mockedClass.firstNestedClass.secondNestedClass.testAsyncMethod.mockResolvedValueOnce(123);
    mockedClass.firstNestedClass.secondNestedClass.testAsyncMethod.mockRejectedValueOnce(new Error("Async Error"));

    expect(async () => {
      mockedClass.firstNestedClass.secondNestedClass.testMethod();
      await mockedClass.firstNestedClass.secondNestedClass.testAsyncMethod({ error: false });
      await mockedClass.firstNestedClass.secondNestedClass.testAsyncMethod({ error: true });
    }).toThrowError("Async Error");

    expect(mockedClass.firstNestedClass.secondNestedClass.testMethod.spy()).toHaveBeenCalledTimes(1);
    expect(mockedClass.firstNestedClass.secondNestedClass.testAsyncMethod.spy()).toHaveBeenCalledTimes(2);
    expect(mockedClass.firstNestedClass.secondNestedClass.testAsyncMethod.spy()).toHaveBeenCalledWith({
      error: false,
    });
    expect(mockedClass.firstNestedClass.secondNestedClass.testAsyncMethod.spy()).toHaveBeenCalledWith({
      error: true,
    });
    expect(mockedClass.firstNestedClass.secondNestedClass.testAsyncMethod.spy()).toHaveReturned();
    expect(mockedClass.firstNestedClass.secondNestedClass.testAsyncMethod.spy()).toHaveReturnedTimes(2);
  });
});
