import express from 'express';
import { MealDto } from './dto/MealDto';
import { getUserByUsernameAndPassword } from './infra/user.repository';

export const app = express();
app.use(express.json())

app.get('/', (req, res) => {
  res.send({ message: 'Hello World! How do you feel ?'});
});

app.post('/meal', (req, res) => {
  const data = MealDto.decode(req.body);

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