import * as express from "express";
const router = express.Router();

import validate from "@/middlewares/validate";
import { default as logController } from "./controllers";
import { default as logValidation } from "./validations";

// Get all logs for given habit
router.get("/", validate(logValidation.getLogs), logController.getLogs);

// Log habit
router.post("/", validate(logValidation.logHabit), logController.logHabit);

export default router;
