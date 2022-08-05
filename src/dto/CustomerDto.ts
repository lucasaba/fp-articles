import * as t from 'io-ts';

export const CustomerDto = t.type({
  username: t.string,
  password: t.string,
});
export type CustomerDto = t.TypeOf<typeof CustomerDto>;