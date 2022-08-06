import * as t from 'io-ts';

interface PositiveIntegerBrand {
  readonly PositiveInteger: unique symbol
}

export const PositiveInteger = t.brand(
  t.Int,
  (n: t.Int): n is t.Branded<t.Int, PositiveIntegerBrand> => n >= 0,
  'PositiveInteger'
)

type PositiveInteger = t.TypeOf<typeof PositiveInteger>