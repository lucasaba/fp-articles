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
    "username": "admin",
    "password": "password"
  },
  "order": [
    {
      "food": "banana",
      "quantity": 2
    },
    {
      "food": "pie",
      "quantity": 1
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
- "customer.username" is a string, is required and must be not empty
- "customer.password" is a string, is required and must be not empty
- note, if present, must be a non empty string

We'll split our types in two side: dto and domain. DTOs, Data Transfer Object, will rappresent the outside, untrusted world. While domain are our internal, safe and affordable business logic.

## Users, customers and its repository

Internally, our customers, must be a [User](../src/domain/User.ts). We'll define a User with few properties:

```ts
import * as t from 'io-ts';
import { NonEmptyString } from 'io-ts-types';

export const User = t.type({
  id: NonEmptyString,
  username: NonEmptyString,
  password: NonEmptyString,
});
export type User = t.TypeOf<typeof User>;
```

The `const User` is a [codec](https://github.com/gcanti/io-ts/blob/master/docs/index.md) that is to say something that can encode an object in another object and vicecersa. We also define a `type`, thanks to the `TypeOf` defined in `io-ts` which will infer the type of our codec in order to be able to use it in our code.

Let's see it in action in our [repository](../src/infra/user.repository.ts):

```ts
import { pipe } from "fp-ts/lib/function";
import * as A from 'fp-ts/Array';
import { User } from "../domain/User";
import * as O from "fp-ts/lib/Option";

const rawUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'password'
  }
];

export const getUsers = (data: any[]): User[] => pipe(
  data,
  A.map(user => User.decode(user)),
  A.separate,
  (t) => t.right
);
```

We've got an array of users (rawUsers) and a function wich takes them, decode them, and removes the invalid ones. We'll add some tests to prove it but in the next chapter. But let's see what's going on the getUser function.

- `getUsers` takes an array of anything
- it maps every element of the array applying the decode function of the coder
- it separates valid elements from invalid elements
- it returns the valid one

To do this, it uses some function offered by `fp-ts`. The `pipe` function takes, as first argument, the data to operate with and then, a series of function to be applied to the resulting elaboration. This means that data is passwed to `A.map(user => User.decode(user))`. The result of this map is then passed to `A.separate`. The result of the separate is passed to `(t) => t.right` and the result of this least function is returned outside the `getUsers` function.

`A.map` is function that returns a function. It means that we could have written it in a less "functional" stule using it in this way:

```ts
export const getUsersUnfunctional = (data: any[]): User[] => {
  const decoded = A.map(user => User.decode(user))(data);
  const separated = A.separate(decoded);
  return separated.right;
}
```

So, in our function, it takes the data and applys the decoder. The decoder returns "either" a valid user or an error. It returns them in the form of an [Either](https://gcanti.github.io/fp-ts/modules/Either.ts.html). `Either` is an object which can be `Left` (conventionally meaning wrong) or `Right`. If it is `Left` it means that the provided data is not compliant with the type defined in the decoder. Otherwise it is ok.

The returned array os `Either`s is then passed to the [Array.separate](https://gcanti.github.io/fp-ts/modules/Array.ts.html#separate) function. This creates a new array of arrays: it will contain an array of `Left` values and one of `Right` values.

We can then return the array of `Right`s which is an array of correctly defined users.

Since we'll use the to "authenticate" our customer, we define another function in the repository:

```ts
export const getUserByUsernameAndPassword = (username: string, password: string): O.Option<User> => pipe(
  getUsers(rawUsers),
  A.filter(user => user.username === username && user.password === password),
  getOneOrNone,
);

const getOneOrNone = (items: any[]) => items.length > 0 ? O.some(items[0]) : O.none;
```

The `getUserByUsernameAndPassword` function returns an [Option](https://gcanti.github.io/fp-ts/modules/Option.ts.html). An Option, like an Either, has two possible values: `None` or `Some`. And that exactly wath `getUserByUsernameAndPassword` does: return a valid User or not.

- it takes an array of valid `User`s
- it filters those where username and password are equal to thise passed as argument
- if at least one user is found it returns it, otherwise it returns a `None`

We've done with the user/customer. Let's face our meal order.

## Ordering the meal

Let's start with our meal. The meal order will contain an array of [OrderItemDto](../src/dto/OrderItemDto.ts):

```ts
import * as t from 'io-ts';

export const OrderItemDto = t.type({
  food: t.union([t.literal('banana'), t.literal('pie'), t.literal('carrot')]),
  quantity: PositiveInteger,
});
export type OrderItemDto = t.TypeOf<typeof OrderItemDto>;
```

This should be straightforward: a quantity is a positive integer and a food must be a valid string. Valid string for food are "banana", "pie" and "carrot".

As we mentioned before, `quantity` must be a positive integer. TO do this, we use a special type: a [branded type](https://github.com/gcanti/io-ts/blob/master/index.md#branded-types--refinements). Here's how we define it:

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

A branded type has a codec (we've seen it before), a refinement function and a name. Basically we are sayng that a PositiveInteger is an `Int` codec but it is only valid id the number is greater than 0 (`n >= 0`).

We want only legitimate users to order meal: in order to know if the user is legitimate we'll send the username and password in our order. We'll pass this data in a [CustomerDto](../src/dto/CustomerDto.ts) type.

Last but not least, we can now define a [MealDto](../src/dto/MealDto.ts):

```ts
import * as t from 'io-ts';
import { nonEmptyArray, NonEmptyString } from 'io-ts-types';
import { CustomerDto } from './CustomerDto';
import { OrderItemDto } from './OrderItemDto';

export const MealDto = t.intersection([
  t.type({
    customer: CustomerDto,
    order: nonEmptyArray(OrderItemDto),
  }),
  t.partial({
    note: NonEmptyString,
  })
]);
export type MealDto = t.TypeOf<typeof MealDto>;
```

Here we use an `intersection` with a `partial`: so we define an optional field. We also use two elements from `io-ts-types`: a non empty array and a NonEmptyString which should be self explanatory.... by the way, they are branded types.

## Update the application

Now, we'll pack everything together and start playing with our meal ordering app. We'll add a new route:

```ts
// index.ts
app.post('/meal', (req, res) => {
  const data = MealDto.decode(req.body);

  if (data._tag === 'Left') {
    res.status(400).send('Invalid Meal');
    return;
  }

  const user = getUserByUsernameAndPassword(
    data.right.customer.username,
    data.right.customer.password,
  );

  if (user._tag === 'None') {
    res.status(403).send('Unauthorized');
    return;
  }

  res.status(201).send('Meal order accepted');
});
```

We've defined a new route `/meal` and we use the MealDto codec to validate our data. As we already know the `codec` returns either a `Left` or a `Right` tagged type and, by convention, if the type is Left, something bad has happened while if it is Rigth, everythin is ok.

If data is Left, we send back an HTTP 400 response. 

If data is Right, note that we already know that the meal is good:

- order contains a non empty array of items
- each item has only valid food
- each item has a positivie integer quantity
- if there's a note, it is a non empty string
- we have non empty string username and password

The next step is authenticating our user. We call `getUserByUsernameAndPassword` passing username and password of our customer. If we received a `None` value, the user was not found and thus we return an HTTP 403 response.

If the user is found, we take the meal order and return an HTTP 201 response.

## Let's try it

You can try this sending somw wrong data:

```bash
curl --location --request POST 'http://localhost:3000/meal' \
--header 'Content-Type: application/json' \
--data-raw '{
    "hy": "bye"
}'
```

Response will be `Invalid meal`.

When the meal is valid but not the user:

```bash
curl --location --request POST 'http://localhost:3000/meal' \
--header 'Content-Type: application/json' \
--data-raw '{
    "customer": {
        "username": "nonuser",
        "password": "nonuser"
    },
    "order": [
        {
            "food": "pie",
            "quantity": 1
        }
    ],
    "note": "aaa"
}'
```

the response will be `Unauthorized`

## End of chapter 3

In next chapter we'll start testing our code and refactor our route in order to have some more meaningfull error message and to have a mor functional way of handling data.

