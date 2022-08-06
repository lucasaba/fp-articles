import express from 'express';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World! How do you feel ?');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at https://localhost:${port}`);
});