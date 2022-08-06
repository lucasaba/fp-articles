# Testing and refactoring

We'll start by testing our code. This will enable us to refactor it knowing that its functionalities will not break.

I'll use `jest` since... I'm used to it and I feel comfortable with it. We need to install it in our environment: `docker-compose exec node yarn add --dev jest ts-jest @types/jest`.

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

First user has a numeric id. Third user has empty username and FOuth user ha no password: thus, only the second user will be returned.

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
