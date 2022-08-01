import * as t from 'io-ts';
import { CustomerDto } from './CustomerDto';
import { OrderItemDto } from './OrderItemDto';

export const MealDto = t.intersection([
  t.type({
    customer: CustomerDto,
    order: t.array(OrderItemDto),
  }),
  t.partial({
    note: t.string,
  })
]);
export type MealDto = t.TypeOf<typeof MealDto>;