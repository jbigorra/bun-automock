export class TestClass implements ITestInterface {
  name: string;
  lastName: string;

  constructor(name: string, lastName: string) {
    this.name = name;
    this.lastName = lastName;
  }

  fullname() {
    return this.name + " " + this.lastName;
  }

  async asyncMethodSuccess(): Promise<string> {
    return Promise.resolve("asyncMethod");
  }

  async asyncMethodError(): Promise<Error> {
    return Promise.reject(new Error("asyncMethodError"));
  }
}

export interface ITestInterface {
  name: string;
  lastName: string;
  fullname: () => string;
  asyncMethodSuccess: () => Promise<string>;
  asyncMethodError: () => Promise<Error>;
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
