import * as t from 'io-ts';
import { PositiveInteger } from '../domain/utils/PositiveInteger';

export const OrderItemDto = t.type({
  food: t.union([t.literal('banana'), t.literal('pie'), t.literal('carrot')]),
  quantity: PositiveInteger,
});
export type OrderItemDto = t.TypeOf<typeof OrderItemDto>;
