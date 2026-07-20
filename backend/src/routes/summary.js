import { Router } from "express";
import { generateExecutiveSummary } from "../controllers/summary.js";

const router = Router();

router.get("/", generateExecutiveSummary);

export default router;