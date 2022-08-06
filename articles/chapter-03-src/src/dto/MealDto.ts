import * as t from 'io-ts';
import { nonEmptyArray, NonEmptyString } from 'io-ts-types';
import { CustomerDto } from './CustomerDto';
import { OrderItemDto } from './OrderItemDto';

export const MealDto = t.intersection([
  t.type({
    customer: CustomerDto,
    order: nonEmptyArray(OrderItemDto),
  }),
  t.partial({
    note: NonEmptyString,
  })
]);
export type MealDto = t.TypeOf<typeof MealDto>;