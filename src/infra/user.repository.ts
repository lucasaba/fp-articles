import { pipe } from "fp-ts/lib/function";
import * as A from 'fp-ts/Array';
import { User } from "../domain/User";
import * as O from "fp-ts/lib/Option";

const rawUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'password'
  }
];

export const getUsers = (data: any[]): User[] => pipe(
  data,
  A.map(user => User.decode(user)),
  A.separate,
  (t) => t.right
);

export const getUserById = (id: string, users: any[] = rawUsers): O.Option<User> => pipe(
  getUsers(users),
  A.filter(user => user.id === id),
  getOneOrNone,
);

export const getUserByUsernameAndPassword = (username: string, password: string, users: any[] = rawUsers): O.Option<User> => pipe(
  getUsers(users),
  A.filter(user => user.username === username && user.password === password),
  getOneOrNone,
);

const getOneOrNone = (items: any[]) => items.length > 0 ? O.some(items[0]) : O.none;