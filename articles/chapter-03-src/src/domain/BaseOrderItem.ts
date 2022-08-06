import * as t from 'io-ts';

export const BaseOrderItem = t.type({
  food: t.union([t.literal('banana'), t.literal('pie'), t.literal('carrot')]),
  quantity: t.number,
});
export type BaseOrderItem = t.TypeOf<typeof BaseOrderItem>;
