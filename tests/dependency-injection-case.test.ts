import { afterEach, describe, expect, mock, test } from "bun:test";
import { mockDeepFn } from "../src/mockDeepFn";
import { mockFn } from "../src/mockFn";
import { User, UserAction, type IComplexNestedInterface, type IUserRepository } from "./dependency-injection-fixture";

describe("Dependency Injection - mock testing.", () => {
  describe("UserAction.signUp()", () => {
    afterEach(() => {
      mock.clearAllMocks();
    });

    test("should save a user", async () => {
      const userRepository = mockFn<IUserRepository>();
      const complexService = mockDeepFn<IComplexNestedInterface>();
      const userAction = new UserAction(userRepository, complexService);
      const newUser = new User({ id: "1", name: "John Doe", email: "john.doe@example.com" });
      userRepository.save.mockReturnValue(newUser);

      const user = {
        name: "John Doe",
        email: "john.doe@example.com",
      };

      const actionResult = await userAction.signUp(user);

      expect(userRepository.save.spy()).toHaveBeenCalledWith(new User(user));
      expect(actionResult).toEqual(newUser);
    });

    test("should signup user after saving", async () => {
      const userRepository = mockFn<IUserRepository>();
      const complexService = mockDeepFn<IComplexNestedInterface>();
      const userAction = new UserAction(userRepository, complexService);
      const newUser = new User({ id: "2", name: "John Doe 2", email: "john.doe2@example.com" });
      userRepository.save.mockReturnValue(newUser);
      complexService.auth.service.signUp.mockResolvedValue(newUser);

      const user = {
        name: "John Doe 2",
        email: "john.doe2@example.com",
      };

      const actionResult = await userAction.signUp(user);

      expect(complexService.auth.service.signUp.spy()).toHaveBeenCalledWith(newUser);
      expect(actionResult).toEqual(newUser);
    });

    test("should set new user as current user after signup", async () => {
      const userRepository = mockFn<IUserRepository>();
      const complexService = mockDeepFn<IComplexNestedInterface>();
      const userAction = new UserAction(userRepository, complexService);
      const newUser = new User({ id: "3", name: "John Doe 3", email: "john.doe3@example.com" });
      userRepository.save.mockReturnValue(newUser);
      complexService.auth.service.signUp.mockResolvedValue(newUser);

      const user = {
        name: "John Doe 3",
        email: "john.doe3@example.com",
      };

      const actionResult = await userAction.signUp(user);

      expect(actionResult).toEqual(newUser);
    });

    test("should throw an error if userRepository.save() returns an error", async () => {
      const userRepository = mockFn<IUserRepository>();
      const complexService = mockDeepFn<IComplexNestedInterface>();
      const userAction = new UserAction(userRepository, complexService);
      userRepository.save.mockReturnValue(new Error("User not found"));

      const user = {
        name: "John Doe 4",
        email: "john.doe4@example.com",
      };

      await expect(userAction.signUp(user)).rejects.toThrow("User not found");
    });

    test("should throw an error if complexService.auth.service.signUp() returns an error", async () => {
      const userRepository = mockFn<IUserRepository>();
      const complexService = mockDeepFn<IComplexNestedInterface>();
      const userAction = new UserAction(userRepository, complexService);
      const newUser = new User({ id: "2", name: "John Doe 5", email: "john.doe5@example.com" });
      userRepository.save.mockReturnValue(newUser);
      complexService.auth.service.signUp.mockRejectedValue(new Error("Sign up failed"));

      const user = {
        name: "John Doe 5",
        email: "john.doe5@example.com",
      };

      await expect(userAction.signUp(user)).rejects.toThrow("Sign up failed");
    });
  });
});
