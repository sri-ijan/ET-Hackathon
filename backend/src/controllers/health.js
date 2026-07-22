import { catchAsync } from "../utils/catchAsync.js";
import { checkAiHealth } from "../services/aiService.js";

export const getHealth = catchAsync(async (req, res) => {
  let ai = false;

  try {
    await checkAiHealth();
    ai = true;
  } catch (err) {
    ai = false;
  }

  res.status(200).json({
    status: "success",
    data: {
      status: "UP",
      backend: true,
      ai,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
    },
  });
});
