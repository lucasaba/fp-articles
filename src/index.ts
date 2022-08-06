import express from 'express';
import { MealDto } from './dto/MealDto';
import { getUserByUsernameAndPassword } from './infra/user.repository';

const app = express();
app.use(express.json())
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hallo World! How do you feel ?');
});

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

app.listen(port, () => {
  console.log(`[server]: Server is running at https://localhost:${port}`);
});