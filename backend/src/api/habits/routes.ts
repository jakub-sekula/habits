import * as express from "express"
import {
  getAllHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  logHabit,
  getHabitLogs
} from "./controllers";

const router = express.Router();

// Get all user habits
router.get("/", getAllHabits);

// Get specific habit
router.get("/:id", getHabit);

// Create new habit
router.post("/", createHabit);

// Update a habit
router.put("/:id", updateHabit);

// Log habit
router.post("/:id/logs", logHabit)

// Get all logs for given habit
router.get("/:id/logs", getHabitLogs)

// Delete a habit
router.delete("/:id", deleteHabit);

export default router;
