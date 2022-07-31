import * as t from 'io-ts';
import { nonEmptyArray } from 'io-ts-types';
import { Customer } from './Customer';
import { OrderItem } from './OrderItem';

export const Order = t.intersection([
  t.type({
    customer: Customer,
    items: nonEmptyArray(OrderItem),
  }),
  t.partial({
    note: t.string,
  })
]);
export type Order = t.TypeOf<typeof Order>;
