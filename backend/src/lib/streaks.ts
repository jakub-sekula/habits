import { PrismaClient, Log, Habit } from "@prisma/client";

const prisma = new PrismaClient();

export async function calculateStreaks(habit: Habit): Promise<{
  streakActive: boolean;
  currentStreak: number;
  longestStreak: number;
  score: number;
  multiplier: number;
}> {
  const { frequency, period } = habit;

  const logs = await prisma.log.findMany({
    where: {
      habitId: habit.id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const entryCountByPeriod = calculateEntryCountByPeriod(logs, period);

  // For new habits that don't have any logs yet
  if (Object.keys(entryCountByPeriod).length === 0) {
    return {
      streakActive: false,
      currentStreak: 0,
      longestStreak: 0,
      score: 0,
      multiplier: 0,
    };
  }

  const consecutivePeriods = findConsecutivePeriods(
    entryCountByPeriod,
    period,
    frequency
  );

  const score = calculateScore(consecutivePeriods, period, logs.length);

  const longestStreak = consecutivePeriods.reduce(
    (maxDuration, { duration }) => {
      return duration > maxDuration ? duration : maxDuration;
    },
    0
  );

  const streakActive = await isStreakActive(habit);

  const currentStreak = getCurrentStreak(consecutivePeriods);

  let multiplier = 0;

  if (streakActive) {
    multiplier = getMultiplier(currentStreak, period);
  }

  return {
    streakActive,
    currentStreak,
    longestStreak,
    score,
    multiplier,
  };
}

// Function to calculate logged count and total count for a habit in a given period
export async function calculateCounts(habit: Habit, reference_time: Date = new Date()) {
  if (!habit) {
    throw new Error("Habit not found");
  }

  const time = reference_time;
  const requiredCount = habit.frequency;

  let startDate, endDate;

  switch (habit.period) {
    case "day":
      startDate = new Date(
        time.getFullYear(),
        time.getMonth(),
        time.getDate()
      );
      endDate = new Date(
        time.getFullYear(),
        time.getMonth(),
        time.getDate() + 1
      );
      break;
    case "week":
      const firstDayOfWeek = time.getDate() - time.getDay() + 1;
      startDate = new Date(
        time.getFullYear(),
        time.getMonth(),
        firstDayOfWeek
      );
      endDate = new Date(
        time.getFullYear(),
        time.getMonth(),
        firstDayOfWeek + 7
      );
      break;
    case "month":
      startDate = new Date(time.getFullYear(), time.getMonth(), 1);
      endDate = new Date(time.getFullYear(), time.getMonth() + 1, 1);
      break;
    case "year":
      startDate = new Date(time.getFullYear(), 0, 1);
      endDate = new Date(time.getFullYear() + 1, 0, 1);
      break;
    default:
      throw new Error("Invalid period");
  }

  const loggedCount = await prisma.log.count({
    where: {
      event: "done",
      habitId: habit.id,
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  return {
    loggedCount,
    requiredCount,
  };
}

export async function generateProgressString(
  habit: Habit,
  reference_time: Date = new Date()
) {
  const { loggedCount, requiredCount } = await calculateCounts(
    habit,
    reference_time
  );

  const countString = `${loggedCount} of ${requiredCount}`;

  if (habit.period === "day") {
    return `${countString} today`;
  } else if (habit.period === "week") {
    return `${countString} this week`;
  } else if (habit.period === "month") {
    return `${countString} this month`;
  } else if (habit.period === "year") {
    return `${countString} this year`;
  } else {
    return countString;
  }
}

/**
 * Finds consecutive periods based on the count of entries for each period.
 *
 * @param { { [period: string]: number } } entryCountByPeriod - The count of entries for each period.
 * @param {string} period - The type of period (e.g., "day", "week", "month", "year") to calculate the duration.
 * @param {number} frequency - The minimum frequency required for a period to be considered consecutive.
 * @returns {Array<Object>} An array of objects representing consecutive periods.
 * Each object has the properties:
 *   - periodStart: The start of the consecutive period.
 *   - periodEnd: The end of the consecutive period.
 *   - duration: The duration of the consecutive period.
 */
function findConsecutivePeriods(
  entryCountByPeriod: { [period: string]: number },
  period: string,
  frequency: number
): Array<{ periodStart: string; periodEnd: string; duration: number }> {
  const consecutivePeriods: Array<{
    periodStart: string;
    periodEnd: string;
    duration: number;
  }> = [];
  let periodStart = "";
  let periodEnd = "";

  Object.keys(entryCountByPeriod).forEach((key, index) => {
    const value = entryCountByPeriod[key];

    if (value >= frequency) {
      if (periodStart === "") {
        periodStart = key;
      }
      periodEnd = key;
    } else {
      if (!!periodStart && !!periodEnd) {
        consecutivePeriods.push({
          periodStart,
          periodEnd,
          duration: calculateDuration(periodStart, periodEnd, period),
        });
        periodStart = "";
        periodEnd = "";
      }
    }

    if (
      index === Object.keys(entryCountByPeriod).length - 1 &&
      !!periodStart &&
      !!periodEnd
    ) {
      consecutivePeriods.push({
        periodStart,
        periodEnd,
        duration: calculateDuration(periodStart, periodEnd, period),
      });
    }
  });

  return consecutivePeriods;
}

/**
 * Calculates the duration between two periods based on the provided period type.
 * @param periodStart The start date or value of the period.
 * @param periodEnd The end date or value of the period.
 * @param period The type of period ("day", "week", "month", "year").
 * @returns The duration between the periods in the specified period type.
 */
function calculateDuration(
  periodStart: string,
  periodEnd: string,
  period: string
): number {
  let start: number;
  let end: number;

  if (!periodStart || !periodEnd) return 0;

  switch (period) {
    case "day":
      // format: 2022-12-17
      start = new Date(periodStart).getTime();
      end = new Date(periodEnd).getTime();
      return Math.floor((end - start) / (1000 * 3600 * 24)) + 1;

    case "week":
      // format: 2019-Wk27
      start = parseInt(periodStart.slice(periodStart.indexOf("Wk") + 2));
      end = parseInt(periodEnd.slice(periodEnd.indexOf("Wk") + 2));
      return Math.abs(end - start) + 1;

    case "month":
      // format: 2020-07
      const startYear = parseInt(
        periodStart.slice(0, periodStart.indexOf("-"))
      );
      const startMonth = parseInt(
        periodStart.slice(periodStart.indexOf("-") + 1)
      );
      const endYear = parseInt(periodEnd.slice(0, periodEnd.indexOf("-")));
      const endMonth = parseInt(periodEnd.slice(periodEnd.indexOf("-") + 1));
      const monthsPerYear = 12;
      const yearDiff = endYear - startYear;
      const monthDiff = endMonth - startMonth;
      return monthsPerYear * yearDiff + monthDiff + 1;

    case "year":
      // format: 2018
      start = parseInt(periodStart);
      end = parseInt(periodEnd);
      return Math.abs(end - start) + 1;

    default:
      return 0;
  }
}

/**
 * Calculates the entry count by period based on an array of logs and a specified period.
 * @param logs An array of logs.
 * @param period The period to calculate the entry count for.
 * @returns An object containing the entry count for each period.
 */
function calculateEntryCountByPeriod(
  logs: Log[],
  period: string
): { [period: string]: number } {
  const entryCountByPeriod: { [period: string]: number } = {};

  // Return an empty object if the logs array is empty
  if (logs.length === 0) return entryCountByPeriod;

  // Iterate through the logs array
  logs.forEach((log) => {
    // Extract the date from the log createdAt property
    const date = log.createdAt.toISOString().split("T")[0];

    // Get the period key based on the date and specified period
    const periodKey = getPeriodFromDate(date, period);

    // Increment the count for the period key if it exists, otherwise set it to 1
    if (entryCountByPeriod[periodKey]) {
      entryCountByPeriod[periodKey]++;
    } else {
      entryCountByPeriod[periodKey] = 1;
    }
  });

  return entryCountByPeriod;
}

/**
 * Determines the period key based on a given date and period.
 * @param date The date to determine the period key from.
 * @param period The period for which to determine the key.
 * @returns The period key based on the date and period.
 */
function getPeriodFromDate(date: string, period: string): string {
  switch (period) {
    case "day":
      // For daily period, return the input date as the period key
      return date;
    case "week":
      // For weekly period, calculate the week number and format the period key
      const weekNumber = getWeekNumber(new Date(date));
      return `${new Date(date).getFullYear()}-Wk${weekNumber + 1}`;
    case "month":
      // For monthly period, extract the year and month from the input date
      const [year, month] = date.split("-");
      return `${year}-${month}`;
    case "year":
      // For yearly period, extract the year from the input date
      return date.split("-")[0];
    default:
      return "";
  }
}

/**
 * Calculates the week number of a given date.
 * @param date The date to calculate the week number from.
 * @returns The week number of the provided date.
 */
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const daysOffset = firstDayOfYear.getDay() - 1;
  const firstMondayOfYear = new Date(
    date.getFullYear(),
    0,
    1 + (daysOffset <= 0 ? 7 : 0) - daysOffset
  );
  const diff = date.getTime() - firstMondayOfYear.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
}

async function isStreakActive(
  habit: Habit,
  date: Date = new Date()
): Promise<boolean> {
  try {
    const now = date.getTime();
    const { period, frequency } = habit;
    const allowedTime = (1.1 * getDuration(period)) / 1000;
    const oldestAllowableTime = new Date(now - allowedTime * 1000);

    const logs = await prisma.log.findMany({
      where: {
        habitId: habit.id,
        createdAt: {
          gte: oldestAllowableTime,
          lte: new Date(now),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!logs.length) return false;

    return logs.length >= frequency;
  } catch (err) {
    console.log(err);
    return false;
  }
}

function getDuration(period: string): number {
  const durations: { [key: string]: number } = {
    day: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    week: 7 * 24 * 60 * 60 * 1000, // 1 week in milliseconds
    month: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    year: 365 * 24 * 60 * 60 * 1000, // 1 year in milliseconds
  };

  return durations[period];
}

function getCurrentStreak(
  consecutivesArray: {
    periodStart: string;
    periodEnd: string;
    duration: number;
  }[]
): number {
  try {
    const length = consecutivesArray.length;
    return consecutivesArray[length - 1].duration;
  } catch (err) {
    console.log(err);
    return 0;
  }
}

/**
 * Calculates the score based on consecutive periods, the specified period, and the total number of entries.
 * @param consecutivePeriods An array of consecutive periods with start and end dates and durations.
 *                           Each object in the array should have the following properties:
 *                           - periodStart: The start date of the period.
 *                           - periodEnd: The end date of the period.
 *                           - duration: The duration of the period.
 * @param period The period used for calculating the score.
 * @param totalEntries The total number of entries.
 * @returns The calculated score.
 */
function calculateScore(
  consecutivePeriods: {
    periodStart: string;
    periodEnd: string;
    duration: number;
  }[],
  period: string,
  totalEntries: number
): number {
  let baseRate = getBaseRate(period);

  const streaksBonus = consecutivePeriods.reduce((score, consecutivePeriod) => {
    return score + baseRate * getMultiplier(consecutivePeriod.duration, period);
  }, 0);

  const totalScore = baseRate * totalEntries + streaksBonus;
  return totalScore;
}

/**
 * Retrieves the base rate value based on the specified period.
 * @param period The period for which the base rate is retrieved.
 * @returns The base rate value.
 */
function getBaseRate(period: string): number {
  switch (period) {
    case "day":
      return 10;
    case "week":
      return 5;
    case "month":
      return 2.5;
    case "year":
      return 25;
    default:
      return 1;
  }
}

/**
 * Calculates the multiplier based on the current streak, period, and an optional clamp value.
 * @param currentStreak The current streak duration.
 * @param period The period used for calculating the multiplier.
 * @param clamp The maximum value the multiplier can reach (optional, default is 25).
 * @returns The calculated multiplier.
 */
function getMultiplier(
  currentStreak: number,
  period: string,
  clamp = 25
): number {
  let exponent;
  switch (period) {
    case "day":
      exponent = 1.05;
      break;
    case "week":
      exponent = 1.025;
      break;
    case "month":
      exponent = 1.0125;
      break;
    case "year":
      exponent = 2;
      break;
    default:
      exponent = 1;
      break;
  }

  const multiplier = Math.min(exponent ** currentStreak, clamp);
  return multiplier;
}

export default {
  calculateStreaks,
  findConsecutivePeriods,
  calculateDuration,
  calculateEntryCountByPeriod,
  getPeriodFromDate,
  getWeekNumber,
  isStreakActive,
  getDuration,
  getCurrentStreak,
  calculateScore,
  getBaseRate,
  getMultiplier,
};