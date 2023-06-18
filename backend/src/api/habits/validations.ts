import Joi, { bool } from "joi";

const createHabit = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    frequency: Joi.number().positive().integer().optional(),
    period: Joi.string().valid("day", "week", "month", "year").optional(),
    weekdays: Joi.array()
      .items(
        Joi.string().valid("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
      )
      .optional(),
    color: Joi.string().optional(),
    image: Joi.string().optional().allow(null, ""),
    reminder: Joi.boolean().optional(),
    archived: Joi.boolean().optional(),
  }),
};

const updateHabit = {
  body: Joi.object().keys({
    name: Joi.string().optional(),
    frequency: Joi.number().positive().integer().optional(),
    period: Joi.string().valid("day", "week", "month", "year").optional(),
    weekdays: Joi.array()
      .items(
        Joi.string().valid("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
      )
      .optional(),
    color: Joi.string().optional(),
    image: Joi.string().optional(),
    reminder: Joi.boolean().optional(),
    archived: Joi.boolean().optional(),
  }),
};

const getHabit = {
  params: Joi.object().keys({
    id: Joi.string(),
  }),
  query: Joi.object().keys({
    date: Joi.date(),
  }),
};

const getHabits = {
  query: Joi.object().keys({
    period: Joi.string().valid("day", "month", "year", "week"),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    date: Joi.date(),
  }),
};
const deleteHabit = {
  params: Joi.object().keys({
    id: Joi.string(),
  }),
};

export default {
  createHabit,
  updateHabit,
  getHabit,
  getHabits,
  deleteHabit,
};
