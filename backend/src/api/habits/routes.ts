import express = require("express");

import {
  getAllHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  logHabit
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
router.post("/:id/log", logHabit)

// Delete a habit
router.delete("/:id", deleteHabit);

export default router;
