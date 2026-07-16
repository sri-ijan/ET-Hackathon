/**
 * Wraps async Express middleware/routes to catch rejected promises and forward them to the error handler.
 * Avoids verbose try-catch blocks in controllers.
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
