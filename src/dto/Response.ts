type Response = {
  code: number,
  message: string,
};

export const created = (message: string): Response => ({
  code: 201,
  message
});

export const badRequest = (message: string): Response => ({
  code: 400,
  message
});

export const unauthorized = (message: string): Response => ({
  code: 403,
  message
});

export const internalServerError = (message: string): Response => ({
  code: 500,
  message
});
