import { app } from "../app";
import request from "supertest";

describe("Meal", () => {
  it('should order a correct meal', async () => {
    const order = getAMeal();
    const response = await request(app).post("/meal").send(order);
    expect(response.statusCode).toBe(201);
    expect(response.body).toStrictEqual({
      message: 'Meal order accepted'
    });
  });

  describe('Unauthorized', () => {
    it('should return unauthorized if a valid user is not found', async () => {
      const order = getAMeal();
      order.customer.password = 'badPass';
      const response = await request(app).post("/meal").send(order);
      expect(response.statusCode).toBe(403);
      expect(response.body).toStrictEqual({
        message: 'Unauthorized'
      });
    });
  });

  describe('Invalid request', () => {
    it('should return bad request if customer has no password', async () => {
      const order = getAMeal();
      const invalidRequest = {
        ...order,
        customer: {
          username: "user"
        },
      };
      const response = await request(app).post("/meal").send(invalidRequest);
      expect(response.statusCode).toBe(400);
      expect(response.body).toStrictEqual({
        message: 'Invalid Meal'
      });
    });

    it('should return bad request an if empty note is provided', async () => {
      const order = getAMeal();
      const invalidRequest = {
        ...order,
        note: '',
      };
      const response = await request(app).post("/meal").send(invalidRequest);
      expect(response.statusCode).toBe(400);
      expect(response.body).toStrictEqual({
        message: 'Invalid Meal'
      });
    });

    it('should return bad request if an empty order is provided', async () => {
      const order = getAMeal();
      const invalidRequest = {
        ...order,
        order: [],
      };
      const response = await request(app).post("/meal").send(invalidRequest);
      expect(response.statusCode).toBe(400);
      expect(response.body).toStrictEqual({
        message: 'Invalid Meal'
      });
    });

    it('should return bad request if an order with invalid food is provided', async () => {
      const order = getAMeal();
      const invalidRequest = {
        ...order,
        order: [
          {
            food: 'pineapple',
            quantity: 1
          },
          {
            food: 'pie',
            quantity: 10,
          }
        ],
      };
      const response = await request(app).post("/meal").send(invalidRequest);
      expect(response.statusCode).toBe(400);
      expect(response.body).toStrictEqual({
        message: 'Invalid Meal'
      });
    });

    it('should return bad request if an order with invalid float quantity is provided', async () => {
      const order = getAMeal();
      const invalidRequest = {
        ...order,
        order: [
          {
            food: 'pie',
            quantity: 10.5,
          }
        ],
      };
      const response = await request(app).post("/meal").send(invalidRequest);
      expect(response.statusCode).toBe(400);
      expect(response.body).toStrictEqual({
        message: 'Invalid Meal'
      });
    });

    it('should return bad request if an order with invalid negative quantity is provided', async () => {
      const order = getAMeal();
      const invalidRequest = {
        ...order,
        order: [
          {
            food: 'pie',
            quantity: -10,
          }
        ],
      };
      const response = await request(app).post("/meal").send(invalidRequest);
      expect(response.statusCode).toBe(400);
      expect(response.body).toStrictEqual({
        message: 'Invalid Meal'
      });
    });
  })
});

function getAMeal() {
  return {
    customer: {
      username: 'admin',
      password: 'password',
    },
    order: [
      {
        food: 'pie',
        quantity: 1,
      }
    ]
  }
}