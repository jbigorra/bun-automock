import { randomUUIDv7 } from "bun";

export interface IUserRepository {
  save: (user: User) => User | Error;
  findById: (id: string) => User | Error;
}

export interface IComplexNestedInterface {
  auth: {
    service: {
      signUp: (user: User) => Promise<User | Error>;
    };
  };
}

export type TUser = {
  id?: string;
  name: string;
  email: string;
};

export class User {
  id?: string;
  name: string;
  email: string;

  constructor(user: TUser) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
  }
}

export class UserRepository implements IUserRepository {
  users: Map<string, User> = new Map();

  findById(id: string) {
    const user = this.users.get(id);
    if (!user) {
      return new Error("User not found");
    }
    return user;
  }

  save(user: User) {
    if (user.id && this.users.has(user.id)) {
      return new Error("User already exists");
    }

    if (!user.id) {
      user.id = randomUUIDv7("hex", new Date());
    }

    this.users.set(user.id, user);

    return user;
  }
}

export class UserAction {
  private readonly userRepository: IUserRepository;
  private readonly complexNestedInterface: IComplexNestedInterface;

  constructor(userRepository: IUserRepository, complexNestedInterface: IComplexNestedInterface) {
    this.userRepository = userRepository;
    this.complexNestedInterface = complexNestedInterface;
  }

  async signUp(user: TUser): Promise<User> {
    const newUser = new User(user);
    const result = this.userRepository.save(newUser);

    if (result instanceof Error) {
      throw result;
    }

    const authResult = await this.complexNestedInterface.auth.service.signUp(result);

    if (authResult instanceof Error) {
      throw authResult;
    }

    return result;
  }

  async getUser(id: string): Promise<User | Error> {
    const user = this.userRepository.findById(id);

    if (user instanceof Error) {
      throw user;
    }

    return user;
  }
}
