export class TestClass implements ITestInterface {
  name: string;
  lastName: string;
  firstNestedClass: TestClass2;

  constructor(
    name: string,
    lastName: string,
    nestedClass: TestClass2 = new TestClass2()
  ) {
    this.name = name;
    this.lastName = lastName;
    this.firstNestedClass = nestedClass;
  }

  get fullname() {
    return this.name + " " + this.lastName;
  }

  nickName() {
    return this.name + " 123";
  }

  async asyncMethod(ops: { error?: boolean }): Promise<string | Error> {
    if (ops.error) {
      return Promise.reject(new Error("asyncMethodError"));
    }
    return Promise.resolve("asyncMethod");
  }
}

export class TestClass2 implements INestedInterface {
  testNumber: number;
  secondNestedClass: IThirdLevelNestedInterface;

  constructor(nestedClass: TestClass3 = new TestClass3()) {
    this.testNumber = 1;
    this.secondNestedClass = nestedClass;
  }

  get testGetter(): number {
    return this.testNumber;
  }

  testMethod(): void {
    console.log(this.testNumber);
  }

  async testAsyncMethod(ops: { error?: boolean }): Promise<undefined | Error> {
    if (ops.error) {
      return Promise.reject(new Error("testAsyncMethodError"));
    }
    return Promise.resolve(undefined);
  }
}

export class TestClass3 implements IThirdLevelNestedInterface {
  testObject: { [key: string]: unknown };

  constructor() {
    this.testObject = { test: "test", test2: 2 };
  }

  get testGetter() {
    return { test: "test", test2: "2", test3: "test3" };
  }

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

export interface ITestInterface {
  name: string;
  lastName: string;
  fullname: string;
  nickName: () => string;
  asyncMethod: (ops: { error?: boolean }) => Promise<string | Error>;
  firstNestedClass: TestClass2;
}

export interface INestedInterface {
  testNumber: number;
  testGetter: number;
  testMethod: () => void;
  testAsyncMethod: (ops: { error?: boolean }) => Promise<undefined | Error>;
  secondNestedClass: IThirdLevelNestedInterface;
}

export interface IThirdLevelNestedInterface {
  testObject: { [key: string]: unknown };
  testGetter: Record<string, string>;
  testMethod: () => () => number;
  testAsyncMethod: (ops: { error?: boolean }) => Promise<number | Error>;
}

// Class instance
console.log("\n### Class instance");
const person = new TestClass("John", "Doe");

const allKeys = [
  ...Object.getOwnPropertyNames(person),
  ...Object.getOwnPropertyNames(Object.getPrototypeOf(person)),
];

console.log(allKeys);

for (const key of allKeys) {
  if (key !== "constructor") {
    const element = person[key as keyof typeof person];
    const type = typeof element;
    console.log(key, type);
  }
}
