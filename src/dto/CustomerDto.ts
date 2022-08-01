import * as t from 'io-ts';

export const CustomerDto = t.type({
  name: t.string,
});
export type CustomerDto = t.TypeOf<typeof CustomerDto>;