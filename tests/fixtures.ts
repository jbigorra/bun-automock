export interface ITestInterface {
  nickName: () => string;
  asyncMethod: (ops: { error?: boolean }) => Promise<string | Error>;
  firstNestedClass: TestClass2;
}

export interface INestedInterface {
  method: () => void;
  asyncMethod: (ops: { error?: boolean }) => Promise<undefined | Error>;
  secondNestedClass: ISecondDegreeNestedInterface;
}

export interface ISecondDegreeNestedInterface {
  testMethod: () => () => number;
  testAsyncMethod: (ops: { error?: boolean }) => Promise<number | Error>;
}

export class TestClass implements ITestInterface {
  firstNestedClass: TestClass2;

  constructor(nestedClass: TestClass2 = new TestClass2()) {
    this.firstNestedClass = nestedClass;
  }

  nickName() {
    return "Johny Bravo";
  }

  async asyncMethod(ops: { error?: boolean }): Promise<string | Error> {
    if (ops.error) {
      return Promise.reject(new Error("asyncMethodError"));
    }
    return Promise.resolve("asyncMethod");
  }
}

export class TestClass2 implements INestedInterface {
  secondNestedClass: ISecondDegreeNestedInterface;

  constructor(nestedClass: TestClass3 = new TestClass3()) {
    this.secondNestedClass = nestedClass;
  }

  method(): void {
    console.log("testMethod called from TestClass2");
  }

  async asyncMethod(ops: { error?: boolean }): Promise<undefined | Error> {
    if (ops.error) {
      return Promise.reject(new Error("testAsyncMethodError"));
    }
    return Promise.resolve(undefined);
  }
}

export class TestClass3 implements ISecondDegreeNestedInterface {
  testMethod() {
    return () => 1;
  }

  async testAsyncMethod(ops: { error?: boolean }): Promise<number | Error> {
    if (ops.error) {
      return Promise.reject(new Error("testAsyncMethodError"));
    }
    return Promise.resolve(1);
  }
}
