# What is this app ?

This app is going to be a meal quotation enginene API. The user is going to provide the API some information about a meal and the app will return an estimate for the meal. It will grow in complexity but it will start quite simple.

## Let's define a meal

We are going to define a DTO to handle incoming data. The DTO will be strongly typed and verified with [io-ts](https://github.com/gcanti/io-ts). So let's start by adding it to our dependencies: `docker-compose run --rm node yarn add io-ts fp-ts` (fp-ts is peer dependency of io-ts).

In his initial rappresentation, a meal has a customer, order and notes. Our API is going to accept the following data:

```json
{
  "customer": {
    "name": "Jack",
  },
  "order": [
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

Let's see how we can do that. Here's an initial definition of an (OrderItem)[../src/dto/OrderItem.ts]:

```ts
import * as t from 'io-ts';

export const OrderItem = t.type({
  food: t.union([t.literal('banana'), t.literal('pie'), t.literal('carrot')]),
  quantity: t.number,
});
export type OrderItem = t.TypeOf<typeof OrderItem>;
```

An order item is define by a `food`, wich can only be the string banana or pie or carrot, and quantity which must be a number. Using io-ts we'll have a type check right on our IDE. If you try to create an order item with the wrong food, your IDE will tell you...you're doing it wrong!

```ts
const testOrderItem: OrderItem = {
  food: 'apple', // Type apple is not assignable to type '"banana" | "pie" | "carrot"'
  quantity: -1,
}
```

Obviously quantity should throw some error too: we're required to have a positive quantity. Let's introduce [branded types](https://github.com/gcanti/io-ts/blob/master/index.md#branded-types--refinements).

We can copy/paste the example provided in io-ts. We create a new file in `utils` folder and call it PositiveNumber.ts. Here's the code:

```ts
import * as t from 'io-ts';

interface PositiveBrand {
  readonly Positive: unique symbol;
}

export const Positive = t.brand(
  t.number,
  (n): n is t.Branded<number, PositiveBrand> => 0 < n,
  'Positive'
)

type Positive = t.TypeOf<typeof Positive>
```

We update order and force quantiti to be `Positive': `quantity: Positive,`.

```ts
const testOrderItem: OrderItem = {
  food: 'banana',
  quantity: -1, //
}
```
