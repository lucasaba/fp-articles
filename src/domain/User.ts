import * as t from 'io-ts';
import { NonEmptyString } from 'io-ts-types';

export const User = t.type({
  id: NonEmptyString,
  username: NonEmptyString,
  password: NonEmptyString,
});
export type User = t.TypeOf<typeof User>;