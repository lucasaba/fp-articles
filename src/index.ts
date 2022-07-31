import express from 'express';
import { OrderItem } from './domain/OrderItem';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  const test = OrderItem.decode({
    food: 'pie',
    quantity: 11,
  });
  if (test._tag === 'Left') {
    res.status(400).send('Left');
  } else {
    res.send('Right');
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at https://localhost:${port}`);
});