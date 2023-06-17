import Joi from "joi";

const logHabit = {
  query: Joi.object().keys({
    habitId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    event: Joi.string().valid("done", "skipped"),
  }),
};

const getLogs = {
  query: Joi.object().keys({
    habitId: Joi.string(),
    sortBy: Joi.string().valid(
      "createdAt",
      "habit_score",
      "total_score",
      "points_added"
    ),
    sortType: Joi.string().valid("asc", "desc"),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export default {
  logHabit,
  getLogs,
};
