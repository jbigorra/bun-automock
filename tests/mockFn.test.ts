import { describe, expect, test as it, test } from "bun:test";
import { mockFn } from "../src/mockFn";
import { TestClass, type ITestInterface } from "./fixtures";

describe("mockFn - with Class", () => {
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
    expect(mockedClass.asyncMethod({ error: false })).resolves.toBe("Async Full Name");
  });

  test("mocked async methods preserve their signature, can use mock methods and return rejected values", () => {
    const mockedClass = mockFn<TestClass>();

    mockedClass.asyncMethod.mockRejectedValue(new Error("Async Error"));

    // The object passed is just to signal the type of Promise to be returned (rejected in this case)
    expect(mockedClass.asyncMethod({ error: true })).rejects.toThrow("Async Error");
  });

  test("spy() method should work for mockFn", () => {
    const mockedClass = mockFn<TestClass>();

    mockedClass.name.mockReturnValue("John");
    mockedClass.nickName.mockReturnValue("Johnny");

    // Call the mocked functions
    mockedClass.name();
    mockedClass.nickName();
    mockedClass.nickName();

    // Use .spy() method for test assertions
    expect(mockedClass.name.spy()).toHaveBeenCalledTimes(1);
    expect(mockedClass.nickName.spy()).toHaveBeenCalledTimes(2);
    expect(mockedClass.name.spy()).toHaveReturnedWith("John");
    expect(mockedClass.nickName.spy()).toHaveReturnedWith("Johnny");
  });
});
describe("mockFn - with Interface", () => {
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
    expect(mockedClass.asyncMethod({ error: false })).resolves.toBe("Async Full Name");
    expect(mockedClass.asyncMethod({ error: true })).rejects.toThrow("Async Error");
  });

  test("spy() method should work for mockFn", async () => {
    const mockedClass = mockFn<ITestInterface>();
    mockedClass.nickName.mockReturnValue("Johnny");
    mockedClass.asyncMethod.mockResolvedValueOnce("Async Full Name");
    mockedClass.asyncMethod.mockRejectedValueOnce(new Error("Async Error"));

    expect(async () => {
      mockedClass.nickName();
      mockedClass.nickName();
      await mockedClass.asyncMethod({ error: false });
      await mockedClass.asyncMethod({ error: true });
    }).toThrowError("Async Error");

    expect(mockedClass.nickName.spy()).toHaveBeenCalledTimes(2);
    expect(mockedClass.asyncMethod.spy()).toHaveBeenCalledTimes(2);
    expect(mockedClass.nickName.spy()).toHaveReturnedWith("Johnny");
    expect(mockedClass.asyncMethod.spy()).toHaveBeenNthCalledWith(1, { error: false });
    expect(mockedClass.asyncMethod.spy()).toHaveBeenNthCalledWith(2, { error: true });
  });
});
