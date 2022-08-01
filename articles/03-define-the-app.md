# What is this app ?

This app is going to be a meal quotation enginene API. The user is going to provide the API some information about a meal and the app will return an estimate for the meal. It will grow in complexity but it will start quite simple.

## Let's define a meal

We are going to define a DTO to handle incoming data. The DTO will be strongly typed and verified with [io-ts](https://github.com/gcanti/io-ts). We're going to use many different package derived from the work of [Giulio Canti](https://github.com/gcanti), namely:

- [io-ts](https://github.com/gcanti/io-ts): a runtime type system for decodin/encoding data
- [fp-ts](https://github.com/gcanti/fp-ts): functional programming for Typescript
- [newtype-ts](https://github.com/gcanti/newtype-ts): a libriry that let's you define a new type from an existing one
- [io-ts-types](https://github.com/gcanti/io-ts-types): a collection of codecs and combinators for use with io-ts
- [monocle-ts](https://github.com/gcanti/monocle-ts): a partial porting of [Scala monocle](https://github.com/optics-dev/Monocle) needed by the previous types extensions

So let's start by adding it to our dependencies: `docker-compose run --rm node yarn add io-ts fp-ts newtype-ts io-ts-types monocle-ts`.

In his initial rappresentation, a meal has a customer, an order and a note. Our API is going to accept the following data:

```json
{
  "customer": {
    "name": "Jack",
  },
  "items": [
    {
      "food": "banana",
      "quantity": 2,
    },
    {
      "food": "pie",
      "quantity": 1,
    },
  ],
  "note": "Mind the gap!"
}
```

Quite easy, isn't it ?

We'll require some validation:

- the order must have at least one item
- the quantity in the item must be a positive number
- the food must be a "valid" food
- "customer.name" is a string, is required and must be at least of two characters
- note, if present, must be a string

We'll split our types in two side: dto and domain. DTOs, Data Transfer Object, will rappresent the outside, untrusted world. While domain are out internal, protected and affordable business logic.

Since we don't like, at least I don't, to repeat ourselves we create a [BaseOrderItem](../src/domain/BaseOrderItem.ts) which will handle a basic definition of an item in the order array:

```ts
import * as t from 'io-ts';

export const BaseOrderItem = t.type({
  food: t.union([t.literal('banana'), t.literal('pie'), t.literal('carrot')]),
  quantity: t.number,
});
export type BaseOrderItem = t.TypeOf<typeof BaseOrderItem>;
```

As you can see, we already have a check on the allowed food but we still don't have any control over the `quantity`.

This BaseOrderItem type, is then copied from the [OrderItemDto](../src/dto/OrderItemDto.ts):

```ts
import * as t from 'io-ts';
import { BaseOrderItem } from '../domain/BaseOrderItem';

export const OrderItemDto = BaseOrderItem;
export type OrderItemDto = t.TypeOf<typeof OrderItemDto>;
```

Last but not least, we define our domain rappresentation of an [OrderItem](../src/domain/OrderItem.ts). We'll use a specil type, a [branded type](https://github.com/gcanti/io-ts/blob/master/index.md#branded-types--refinements), to define positive integers:

```ts
import * as t from 'io-ts';
import { PositiveInteger } from './utils/PositiveInteger';
import { BaseOrderItem } from './BaseOrderItem';

export const OrderItem = t.intersection([
  BaseOrderItem,
  t.type ({ quantity: PositiveInteger}),
]);
export type OrderItem = t.TypeOf<typeof OrderItem>;
```

So an OrderItem, in our domain, is a BaseOrderItem where `quantity` is a positive integer. We'll prove this in the next chapter, where we'll start testing our code. Now we can show how it looks like this branded type:

```ts
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
```

A branded type has a codec (we'll explain this later), a refinement function and a name. Basically we are sayng that a PositiveInteger is an `Int` codec but it is only valid id the number is greater than 0 (`n >= 0`).

`Customer` is quite easy. We'll duplicate it in domain and DTO. In domain we'll use the `NonEmptyString` type from `io-ts-types`. In this case, I prefere to duplicate in order to have a clear separation between the meening of o Customer in our domain and that in the outside world.

We can now define a [Meal](../src/domain/Meal.ts):

```ts
import * as t from 'io-ts';
import { nonEmptyArray, NonEmptyString } from 'io-ts-types';
import { Customer } from './Customer';
import { OrderItem } from './OrderItem';

export const Meal = t.intersection([
  t.type({
    customer: Customer,
    items: nonEmptyArray(OrderItem),
  }),
  t.partial({
    note: NonEmptyString,
  })
]);
export type Meal = t.TypeOf<typeof Meal>;
```

Here we use an `intersaction` with a `partial`: so we define an optional field. We also use another element from `io-ts-types`: a non empty array which should be self explanatory.

The DTO, will be similar but with less checks:

...

Now let's use everything and see how they works:

```ts
// index.ts
app.post('/meal', (req, res) => {
  const data = Meal.decode(req.body);
  if (data._tag === 'Left') {
    res.status(400).send('Invalid Meal');
  } else {
    res.send('Meal accepted');
  }
});
```

We've defined a new route `/meal` and we use the Meal codec to validate our data. A `codec` returns either a `Left` or a `Right` tagged type. By convention, if the type is Left, something bad has happened. If it is Rigth, everythin is ok.

You can try this sending somw wrong data:

```bash
curl --location --request POST 'http://localhost:3000/meal' \
--header 'Content-Type: application/json' \
--data-raw '{
    "hy": "bye"
}'
```

Response will be `Invalid meal`. You can try with a valid meal and see what happen.

See you in next chapter to start testing.

