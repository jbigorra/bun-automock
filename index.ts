export const obj = {
  name: "John",
  lastName: "Doe",
  age: 30,
  city: "New York",
  fullname: function () {
    return this.name + " " + this.lastName;
  },
};

export class Person {
  name: string;
  lastName: string;
  age: number;
  city: string;

  constructor(name: string, lastName: string, age: number, city: string) {
    this.name = name;
    this.lastName = lastName;
    this.age = age;
    this.city = city;
  }

  fullname() {
    return this.name + " " + this.lastName;
  }
}

export interface IPerson {
  name: string;
  lastName: string;
  age: number;
  city: string;
  fullname: () => string;
}

// Literal Object
console.log("### Literal Object");
for (const key in obj) {
  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    const element = obj[key as keyof typeof obj];
    const type = typeof element;
    console.log(key, type);
  }
}

// Class instance
console.log("\n### Class instance");
const person = new Person("John", "Doe", 30, "New York");

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
