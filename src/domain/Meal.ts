import * as t from 'io-ts';
import { nonEmptyArray, NonEmptyString } from 'io-ts-types';
import { OrderItem } from './OrderItem';
import { User } from './User';

export const Meal = t.intersection([
  t.type({
    user: User,
    items: nonEmptyArray(OrderItem),
  }),
  t.partial({
    note: NonEmptyString,
  })
]);
export type Meal = t.TypeOf<typeof Meal>;
