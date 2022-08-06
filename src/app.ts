import express from 'express';
import { pipe } from 'fp-ts/lib/function';
import { MealDto } from './dto/MealDto';
import { getUserByUsernameAndPassword } from './infra/user.repository';
import * as E from 'fp-ts/Either';
import * as O from "fp-ts/lib/Option";
import { badRequest } from './dto/Response';
import { Validation } from 'io-ts';
import { User } from './domain/User';
import { None, Some } from 'fp-ts/lib/Option';

export const app = express();
app.use(express.json())

app.get('/', (req, res) => {
  res.send({ message: 'Hello World! How do you feel ?'});
});

app.post('/meal', (req, res) => {
  return pipe(
    req.body,
    MealDto.decode,
    validateUserInOrder,
    getOrElse(unauthorized('Unauthorized'))
    insertOrder,
    getOrElse(internalServerError('Unable to insert order')),
    created('Meal order accepted')
  )

  const data =

  if (data._tag === 'Left') {
    res.status(400).send({ message: 'Invalid Meal'});
    return;
  }

  const user = getUserByUsernameAndPassword(
    data.right.customer.username,
    data.right.customer.password,
  );

  if (user._tag === 'None') {
    res.status(403).send({ message: 'Unauthorized'});
    return;
  }

  res.status(201).send({ message: 'Meal order accepted'});
});

const validateUserInOrder = (meal: Validation<MealDto>): O.Option<User> => getUserByUsernameAndPassword(meal.customer.username, meal.customer.password);