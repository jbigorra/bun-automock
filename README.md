# bun-automock

A TypeScript library that provides automatic mocking utilities for Bun's test framework, enabling easy creation of type-safe mocks for complex objects and nested structures.

## Table of Contents

- [bun-automock](#bun-automock)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Development Setup](#development-setup)
  - [Available Scripts](#available-scripts)
  - [Usage](#usage)
    - [mockFn](#mockfn)
    - [mockDeepFn](#mockdeepfn)
  - [API Reference](#api-reference)
    - [`mockFn<T extends object>(): MockInstance<T>`](#mockfnt-extends-object-mockinstancet)
    - [`mockDeepFn<T extends object>(): MockInstance<T>`](#mockdeepfnt-extends-object-mockinstancet)
  - [Examples](#examples)
    - [Basic Mocking with mockFn](#basic-mocking-with-mockfn)
    - [Deep Mocking with mockDeepFn](#deep-mocking-with-mockdeepfn)
  - [Building for Production](#building-for-production)
  - [Testing](#testing)

## Installation

```bash
bun add bun-automock
```

## Development Setup

To set up the project for development:

```bash
# Install dependencies
bun install

# Or use the custom script that installs both bun and pnpm dependencies
bun run install-deps
```

## Available Scripts

- `bun run test` - Run the test suite
- `bun run build` - Build the project and generate type declarations
- `bun run build:types` - Generate TypeScript declaration files only
- `bun run install-deps` - Install both Bun and pnpm dependencies

## Usage

### mockFn

Creates a shallow mock of an object where each property becomes a Bun mock function. Perfect for mocking services, classes, or interfaces where you need to control the behavior of individual methods.

```typescript
import { mockFn } from 'bun-automock';

interface UserService {
  getName(): string;
  getEmail(): string;
  updateProfile(data: any): Promise<void>;
}

// Create a mock with type safety
const userServiceMock = mockFn<UserService>();

// Configure mock behavior
userServiceMock.getName.mockReturnValue('John Doe');
userServiceMock.getEmail.mockReturnValue('john@example.com');
userServiceMock.updateProfile.mockResolvedValue(undefined);

// Use in tests
expect(userServiceMock.getName()).toBe('John Doe');
expect(userServiceMock.getEmail()).toBe('john@example.com');
await expect(userServiceMock.updateProfile({})).resolves.toBe(undefined);
```

### mockDeepFn

Creates a deep mock that automatically mocks nested objects and their properties. Each property at any level becomes a callable mock function while preserving the ability to access nested properties.

```typescript
import { mockDeepFn } from 'bun-automock';

interface DatabaseService {
  users: {
    repository: {
      findById(id: string): Promise<User>;
      save(user: User): Promise<void>;
    };
    cache: {
      get(key: string): string | null;
      set(key: string, value: string): void;
    };
  };
}

// Create a deep mock
const dbMock = mockDeepFn<DatabaseService>();

// Configure nested mock behavior
dbMock.users.repository.findById.mockResolvedValue({ id: '1', name: 'John' });
dbMock.users.repository.save.mockResolvedValue(undefined);
dbMock.users.cache.get.mockReturnValue('cached-value');

// Use in tests - basic functionality
await expect(dbMock.users.repository.findById('1')).resolves.toEqual({ id: '1', name: 'John' });
expect(dbMock.users.cache.get('key')).toBe('cached-value');

// Use .spy() method for test assertions
expect(dbMock.users.repository.findById.spy()).toHaveBeenCalledWith('1');
expect(dbMock.users.repository.findById.spy()).toHaveBeenCalledTimes(1);
expect(dbMock.users.cache.get.spy()).toHaveBeenCalledWith('key');
```

#### The `.spy()` Method

Each mocked property includes a `.spy()` method that returns the underlying Bun mock function, enabling you to use all standard Bun test assertions:

```typescript
const dbMock = mockDeepFn<DatabaseService>();

// Call the mocked function
await dbMock.users.repository.findById('123');
await dbMock.users.repository.findById('456');

// Use spy() for clean test assertions
expect(dbMock.users.repository.findById.spy()).toHaveBeenCalledTimes(2);
expect(dbMock.users.repository.findById.spy()).toHaveBeenNthCalledWith(1, '123');
expect(dbMock.users.repository.findById.spy()).toHaveBeenNthCalledWith(2, '456');
expect(dbMock.users.repository.findById.spy()).toHaveReturnedTimes(2);
```

## API Reference

### `mockFn<T extends object>(): MockInstance<T>`

Creates a shallow mock where each property of type `T` becomes a Bun mock function.

**Parameters:**
- `T` - The type to mock (interface, class, or object type)

**Returns:**
- `MockInstance<T>` - A proxy object where each property is a Bun mock function

### `mockDeepFn<T extends object>(): MockInstance<T>`

Creates a deep mock that automatically handles nested objects, making every property at any depth a callable mock function.

**Parameters:**
- `T` - The type to mock (interface, class, or object type)

**Returns:**
- `MockInstance<T>` - A proxy object with deep mocking capabilities

**Additional Methods:**
- `.spy()` - Available on each mocked property, returns the underlying Bun mock function for test assertions

## Examples

### Basic Mocking with mockFn

```typescript
import { test, expect } from 'bun:test';
import { mockFn } from 'bun-automock';

interface ApiClient {
  get(url: string): Promise<any>;
  post(url: string, data: any): Promise<any>;
}

test('should mock API client methods', () => {
  const apiMock = mockFn<ApiClient>();
  
  // Configure mocks
  apiMock.get.mockResolvedValue({ data: 'test' });
  apiMock.post.mockResolvedValue({ success: true });
  
  // Test async methods
  expect(apiMock.get('/users')).resolves.toEqual({ data: 'test' });
  expect(apiMock.post('/users', { name: 'John' })).resolves.toEqual({ success: true });
});
```

### Deep Mocking with mockDeepFn

```typescript
import { test, expect } from 'bun:test';
import { mockDeepFn } from 'bun-automock';

interface Application {
  services: {
    user: {
      auth: {
        login(credentials: any): Promise<string>;
        logout(): void;
      };
      profile: {
        get(id: string): Promise<any>;
        update(id: string, data: any): Promise<void>;
      };
    };
  };
}

test('should mock deeply nested structures', async () => {
  const appMock = mockDeepFn<Application>();
  
  // Configure deep mocks
  appMock.services.user.auth.login.mockResolvedValue('token123');
  appMock.services.user.profile.get.mockResolvedValue({ id: '1', name: 'John' });
  
  // Test nested functionality
  const token = await appMock.services.user.auth.login({ username: 'john', password: 'pass' });
  expect(token).toBe('token123');
  
  const profile = await appMock.services.user.profile.get('1');
  expect(profile).toEqual({ id: '1', name: 'John' });
  
  // Use .spy() method for test assertions
  expect(appMock.services.user.auth.login.spy()).toHaveBeenCalledWith({ username: 'john', password: 'pass' });
  expect(appMock.services.user.profile.get.spy()).toHaveBeenCalledWith('1');
  expect(appMock.services.user.auth.login.spy()).toHaveBeenCalledTimes(1);
});
```

## Building for Production

To build the library for distribution:

```bash
bun run build
```

This will:
1. Clean the `dist` directory
2. Bundle the source code using Bun's bundler
3. Generate TypeScript declaration files (`.d.ts`)
4. Create source maps for debugging

The built files will be available in the `dist` directory:
- `index.js` - The bundled JavaScript code
- `index.d.ts` - TypeScript type declarations
- `index.js.map` - Source map for debugging

## Testing

Run the test suite:

```bash
bun test
```

The tests cover both `mockFn` and `mockDeepFn` functionality, including:
- Basic mocking of methods and properties
- Async method mocking (resolved/rejected promises)
- Deep nested object mocking
- The `.spy()` method for test assertions
- Type safety preservation

---

This project was created using `bun init` and leverages [Bun](https://bun.com)'s fast all-in-one JavaScript runtime for optimal performance.
