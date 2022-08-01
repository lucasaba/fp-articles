import express from 'express';
import { Meal } from './domain/Meal';
import { OrderItem } from './domain/OrderItem';

const app = express();
app.use(express.json()) 
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hallo World! How do you feel ?');
});

app.post('/meal', (req, res) => {
  const data = Meal.decode(req.body);
  if (data._tag === 'Left') {
    res.status(400).send('Invalid Meal');
  } else {
    res.send('Meal accepted');
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at https://localhost:${port}`);
});