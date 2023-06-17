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

// Create new habit
router.post(
  "/",
  validate(habitValidation.createHabit),
  habitController.createHabit
);



// Get specific habit
router.get(
  "/:id",
  validate(habitValidation.getHabit),
  habitController.getHabit
);

// Update a habit
router.put(
  "/:id",
  validate(habitValidation.updateHabit),
  habitController.updateHabit
);

// Delete a habit
router.delete(
  "/:id",
  validate(habitValidation.deleteHabit),
  habitController.deleteHabit
);




export default router;
