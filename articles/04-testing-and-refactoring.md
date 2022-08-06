# Testing and refactoring

We'll start by testing our code. This will enable us to refactor it knowing that its functionalities will not break.

I'll use `jest` since... I'm used to it and I feel comfortable with it. We need to install it in our environment: `docker-compose exec node yarn add --dev jest ts-jest  supertest @types/jest @types/supertest`.

We then need to setup its configuration: `docker-compose exec node yarn ts-jest config:init`

This will create a `jest.config.js` file in our root folder. We'll just add `testMatch: ['<rootDir>/src/**/*.spec.ts']` in order to search test only in the `src` folder and match them against the regexp `*.spec.ts`.

## Let's start testing the repository

We add a [user.repository.spec.ts](../src/infra/__test__/user.repository.spec.ts) file. This define an array of users and check that only the valid one is returned:

```ts
describe('User repository', () => {
  it('should only get valid users', () => {
    const rawUsers = [
      {
        id: 1,
        username: 'admin',
        password: 'password'
      },
      {
        id: '2',
        username: 'admin',
        password: 'password'
      },
      {
        id: '3',
        username: '',
        password: 'password'
      },
      {
        id: '4',
        username: 'admin',
      },
    ];
    const users = getUsers(rawUsers);
    expect(users.length).toEqual(1);
    expect(users[0]).toStrictEqual(rawUsers[1]);
  });
});
```

First user has a numeric id. Third user has empty username and fourth user has no password: thus, only the second user will be returned.

Let's test the `getUserByUsernameAndPassword` function. We want to be sure that only one user with correct credential is returned.

```ts
// Spoiler alert: this test wont work!
it('should get the correct user by username and password', () => {
    const rawUsers = [
      {
        id: '1',
        username: 'admin1',
        password: 'password'
      },
      {
        id: '2',
        username: 'admin2',
        password: 'password'
      },
      {
        id: '3',
        username: 'admin',
        password: 'password'
      },
    ];  
    const users = getUsers(rawUsers);
    expect(users.length).toEqual(3);

    const authenticated = getUserByUsernameAndPassword('admin', 'password');
    expect(authenticated._tag).toEqual('Some');
    if (authenticated._tag === 'Some') {
      expect(authenticated.value.id).toEqual(rawUsers[2].id);
    }
  });
```
The test didn't work because the users where taken from the `user.repository.ts` file. In that file, a user with correct username and password is returned but its id is 1.

`getUserByUsernameAndPassword` calls the getUser which uses the internal array to get users. We need to inject the users into the function. We do this by changing its signature:

```ts
export const getUserByUsernameAndPassword = (username: string, password: string, users: any[] = rawUsers): O.Option<User> => pipe(
```

in this way we can inject an array of values which, if not passed, are the internal values. We can now edit our original test:

```ts
const authenticated = getUserByUsernameAndPassword('admin', 'password', rawUsers);
```

and that should pass.

Note that our applications still works with the old default users.

## Testing the express application

We now want to test the ordering application just to be sure that our order will only be acepted when they're correctly formatted.

Firs of all, as suggested in [the official documentation](https://jestjs.io/docs/testing-frameworks), we'll split the application and the server from our `index.ts` and we create an `app.ts` file with a `server.ts` file. We also update our scripts in `package.json` in order to launch the server:

```json
// package.json
{
  ...
  "script": {
    ...
    "start": "node dist/server.js",
    "dev": "concurrently -k \"tsc --project tsconfig.json -w\" \"nodemon ./dist/server.js\""
  }
}
```

Now we can start testing the app. We add a test for the `/` route in [app.root.spec.ts](../src/__test__/app.root.spec.ts).

```ts
import { app } from "../app";
import request from "supertest";

describe("Test the root path", () => {
  test("It should response the GET method", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Hello World! How do you feel ?');
  });
});
```

Test for the `/meal` root are a little bit longer. You can see them in [__test__/app.meal.spec.ts](../src/__test__/app.meal.spec.ts) file.

We test that:

- is correctly returned a 403 when customer is not recognized
- is correctly returned 400 when:
-- customer ha no or empty password
-- no item in order
-- wrong item in order
-- note is empty

Now we can start to refactor.

## Refactoring


