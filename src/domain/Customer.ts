import * as t from 'io-ts';

export const Customer = t.type({
  name: t.string,
});
export type Customer = t.TypeOf<typeof Customer>;