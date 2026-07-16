import { AppError } from '../utils/AppError.js';

/**
 * Validates request schemas using Zod.
 * @param {object} schemas - Object containing schemas for body, query, or params
 */
export const validate = (schemas) => {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (error) {
      // Collect error messages from Zod and forward as Bad Request (400)
      const message = error.errors
        ? error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ')
        : error.message;
      next(new AppError(message, 400));
    }
  };
};
