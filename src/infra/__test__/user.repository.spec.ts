import { getUserByUsernameAndPassword, getUsers } from "../user.repository";

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

    const authenticated = getUserByUsernameAndPassword('admin', 'password', rawUsers);
    expect(authenticated._tag).toEqual('Some');
    if (authenticated._tag === 'Some') {
      expect(authenticated.value.id).toEqual(rawUsers[2].id);
    }
  });
});
