export class TestClass implements ITestInterface {
  name: string;
  lastName: string;

  constructor(name: string, lastName: string) {
    this.name = name;
    this.lastName = lastName;
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

export interface ITestInterface {
  name: string;
  lastName: string;
  fullname: string;
  nickName: () => string;
  asyncMethod: (ops: { error?: boolean }) => Promise<string | Error>;
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
