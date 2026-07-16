import { catchAsync } from '../utils/catchAsync.js';

export const getHealth = catchAsync(async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
    },
  });
});
