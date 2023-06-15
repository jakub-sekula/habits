import * as express from "express";
const router = express.Router();

import validate from "@/middlewares/validate";
import { default as habitController } from "./controllers";
import { default as habitValidation } from "./validations";

// Get all user habits
router.get(
  "/",
  validate(habitValidation.getHabits),
  habitController.getAllHabits
);

// Get specific habit
router.get(
  "/:id",
  validate(habitValidation.getHabit),
  habitController.getHabit
);

// Create new habit
router.post(
  "/",
  validate(habitValidation.createHabit),
  habitController.createHabit
);

// Update a habit
router.put(
  "/:id",
  validate(habitValidation.updateHabit),
  habitController.updateHabit
);

// Log habit
router.post(
  "/:id/logs",
  validate(habitValidation.logHabit),
  habitController.logHabit
);

// Get all logs for given habit
router.get(
  "/:id/logs",
  validate(habitValidation.getLogs),
  habitController.getHabitLogs
);

// Delete a habit
router.delete(
  "/:id",
  validate(habitValidation.deleteHabit),
  habitController.deleteHabit
);

export default router;
