import * as t from 'io-ts';
import { BaseOrderItem } from '../domain/BaseOrderItem';

export const OrderItemDto = BaseOrderItem;
export type OrderItemDto = t.TypeOf<typeof OrderItemDto>;
