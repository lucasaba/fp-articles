import * as t from 'io-ts';
import { PositiveInteger } from './utils/PositiveInteger';
import { BaseOrderItem } from './BaseOrderItem';

export const OrderItem = t.intersection([
  BaseOrderItem,
  t.type ({ quantity: PositiveInteger}),
]);
export type OrderItem = t.TypeOf<typeof OrderItem>;
