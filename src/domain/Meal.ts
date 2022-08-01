import * as t from 'io-ts';
import { nonEmptyArray, NonEmptyString } from 'io-ts-types';
import { Customer } from './Customer';
import { OrderItem } from './OrderItem';

export const Meal = t.intersection([
  t.type({
    customer: Customer,
    items: nonEmptyArray(OrderItem),
  }),
  t.partial({
    note: NonEmptyString,
  })
]);
export type Meal = t.TypeOf<typeof Meal>;
