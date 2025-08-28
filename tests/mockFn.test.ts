import { describe, expect, test } from "bun:test";
import { mockFn } from "../src/mockFn";
import { TestClass, type ITestInterface } from "./fixtures";

describe("mockFn - with class", () => {
  test("mocked methods preserve their signature, can use mock methods and return the pre-defined value", () => {
    const mockedClass = mockFn<TestClass>();

    mockedClass.nickName.mockReturnValue("Mocked Full Name");

    expect(mockedClass.nickName()).toBe("Mocked Full Name");
  });

  test("mocked async method preserve their signature, can use mock methods and return resolved values", () => {
    const mockedClass = mockFn<TestClass>();

    mockedClass.asyncMethod.mockResolvedValue("Async Full Name");

    // The object passed is just to signal the type of Promise to be returned (resolved in this case)
    expect(mockedClass.asyncMethod({ error: false })).resolves.toBe("Async Full Name");
  });

  test("mocked async methods preserve their signature, can use mock methods and return rejected values", () => {
    const mockedClass = mockFn<TestClass>();

    mockedClass.asyncMethod.mockRejectedValue(new Error("Async Error"));

    // The object passed is just to signal the type of Promise to be returned (rejected in this case)
    expect(mockedClass.asyncMethod({ error: true })).rejects.toThrow("Async Error");
  });

  test("mocked methods can be spied upon with .spy()", async () => {
    const mockedClass = mockFn<TestClass>();
    mockedClass.nickName.mockReturnValue("Johnny");
    mockedClass.asyncMethod.mockResolvedValueOnce("Async Full Name");
    mockedClass.asyncMethod.mockResolvedValueOnce("Second Call - Mocked asyncMethod");

    mockedClass.nickName();
    mockedClass.nickName();
    await mockedClass.asyncMethod({ error: false });
    await mockedClass.asyncMethod({ error: true });

    expect(mockedClass.nickName.spy()).toHaveBeenCalledTimes(2);
    expect(mockedClass.nickName.spy()).toHaveReturnedWith("Johnny");
    expect(mockedClass.asyncMethod.spy()).toHaveBeenCalledTimes(2);
    expect(mockedClass.asyncMethod.spy()).toHaveBeenNthCalledWith(1, { error: false });
    expect(mockedClass.asyncMethod.spy()).toHaveBeenNthCalledWith(2, { error: true });
    expect(mockedClass.asyncMethod.spy()).toHaveReturnedTimes(2);
  });

  test("mocked methods can be spied upon when no mock return/resolve value is set", async () => {
    const mockedClass = mockFn<TestClass>();

    mockedClass.nickName();
    await mockedClass.asyncMethod({ error: false });
    await mockedClass.asyncMethod({ error: true });

    expect(mockedClass.nickName.spy()).toHaveBeenCalledTimes(1);
    expect(mockedClass.asyncMethod.spy()).toHaveBeenCalledTimes(2);
    expect(mockedClass.asyncMethod.spy()).toHaveBeenNthCalledWith(1, { error: false });
    expect(mockedClass.asyncMethod.spy()).toHaveBeenNthCalledWith(2, { error: true });
  });
});
describe("mockFn - with Interface", () => {
  test("mocked methods preserve their signature, can use mock methods and return the pre-defined value", () => {
    const mockedClass = mockFn<ITestInterface>();

    mockedClass.nickName.mockReturnValue("Mocked Full Name");

    expect(mockedClass.nickName()).toBe("Mocked Full Name");
  });

  test("mocked async method preserve their signature, can use mock methods and return resolved values", () => {
    const mockedClass = mockFn<ITestInterface>();

    mockedClass.asyncMethod.mockResolvedValue("Async Full Name");

    // The object passed is just to signal the type of Promise to be returned (resolved in this case)
    expect(mockedClass.asyncMethod({ error: false })).resolves.toBe("Async Full Name");
  });

  test("mocked async methods preserve their signature, can use mock methods and return rejected values", () => {
    const mockedClass = mockFn<ITestInterface>();

    mockedClass.asyncMethod.mockRejectedValue(new Error("Async Error"));

    // The object passed is just to signal the type of Promise to be returned (rejected in this case)
    expect(mockedClass.asyncMethod({ error: true })).rejects.toThrow("Async Error");
  });

  test("mocked methods can be spied upon with .spy()", async () => {
    const mockedClass = mockFn<ITestInterface>();
    mockedClass.nickName.mockReturnValue("Johnny");
    mockedClass.asyncMethod.mockResolvedValueOnce("Async Full Name");
    mockedClass.asyncMethod.mockResolvedValueOnce("Second Call - Mocked asyncMethod");

    mockedClass.nickName();
    mockedClass.nickName();
    await mockedClass.asyncMethod({ error: false });
    await mockedClass.asyncMethod({ error: true });

    expect(mockedClass.nickName.spy()).toHaveBeenCalledTimes(2);
    expect(mockedClass.nickName.spy()).toHaveReturnedWith("Johnny");
    expect(mockedClass.asyncMethod.spy()).toHaveBeenCalledTimes(2);
    expect(mockedClass.asyncMethod.spy()).toHaveBeenNthCalledWith(1, { error: false });
    expect(mockedClass.asyncMethod.spy()).toHaveBeenNthCalledWith(2, { error: true });
    expect(mockedClass.asyncMethod.spy()).toHaveReturnedTimes(2);
  });

  test("mocked methods can be spied upon when no mock return/resolve value is set", async () => {
    const mockedClass = mockFn<ITestInterface>();

    mockedClass.nickName();
    await mockedClass.asyncMethod({ error: false });
    await mockedClass.asyncMethod({ error: true });

    expect(mockedClass.nickName.spy()).toHaveBeenCalledTimes(1);
    expect(mockedClass.asyncMethod.spy()).toHaveBeenCalledTimes(2);
    expect(mockedClass.asyncMethod.spy()).toHaveBeenNthCalledWith(1, { error: false });
    expect(mockedClass.asyncMethod.spy()).toHaveBeenNthCalledWith(2, { error: true });
  });
});
