import * as t from 'io-ts';
import { NonEmptyString } from 'io-ts-types';

export const Customer = t.type({
  name: NonEmptyString,
});
export type Customer = t.TypeOf<typeof Customer>;