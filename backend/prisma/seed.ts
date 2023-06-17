import { Habit } from "@prisma/client";

// Import the Prisma Client
const { PrismaClient } = require("@prisma/client");

import { default as habitUtils } from "@/api/habits/utils";
import { default as streaks } from "@/lib/streaks";

// Create an instance of the Prisma Client
const prisma = new PrismaClient();

// Seed function
export async function seed(userId = "H6Dmr9nLRqdGsrNTk6HhTSYw8IT2") {
  console.time("Seed time"); // Start the timer
  // Delete all existing habits and logs
  await prisma.habit.deleteMany({ where: { userId } });

  let totalScore = 0

  // Helper function to generate logs
  async function generateLogs(habit: Habit, requiredLogs: number) {
    const currentDate = new Date();

    let consecutiveMissedLogs = 0; // Count of consecutive missed logs

    // Generate logs exceeding the required frequency
    for (let i = 0; i < requiredLogs; i++) {
      const logDate = new Date(currentDate);

      if (habit.period === "day") {
        logDate.setDate(logDate.getDate() - i);
      } else if (habit.period === "week") {
        logDate.setDate(logDate.getDate() - i * 7);
      } else if (habit.period === "month") {
        logDate.setMonth(logDate.getMonth() - i);
      } else if (habit.period === "year") {
        logDate.setFullYear(logDate.getFullYear() - i);
      }

      let numLogsPerPeriod = habit.frequency;

      // Introduce some randomness to the log frequency
      const randomValue = Math.random();
      // 0.5% chance of incomplete logs
      if (randomValue < 0.005) {
        numLogsPerPeriod--; // Decrease log frequency by 1
        // 10% chance of more logs than needed
      } else if (randomValue < 0.1) {
        numLogsPerPeriod++; // Increase log frequency by 1
      }

      // Ensure the log frequency is within the desired range
      numLogsPerPeriod = Math.max(1, numLogsPerPeriod);

      for (let j = 0; j < numLogsPerPeriod; j++) {
        // 1% chance of a missed log
        const isMissedLog = Math.random() < 0.01;
        if (isMissedLog && consecutiveMissedLogs <= 3) {
          consecutiveMissedLogs++;
        } else {
          let streak = 0;
          consecutiveMissedLogs = 0;
          const { score: scoreBefore } = await habitUtils.getHabitDetails(
            habit
          );

          let log = await prisma.log.create({
            data: {
              event: "done",
              createdAt: logDate,
              habit: {
                connect: { id: habit.id },
              },
              user: {
                connect: { uid: userId },
              },
            },
          });

          const isStreakActive = await streaks.isStreakActive(habit,logDate);

          if (isStreakActive) streak++;

          const multiplier = streaks.getMultiplier(streak, habit.period);
          const baseRate = streaks.getBaseRate(habit.period);

          const streakBonus = isStreakActive ? streak * baseRate * multiplier : 0;
          // const pointsAdded = baseRate + streakBonus;
          // const newHabitScore = habit.score + pointsAdded;
          const { score: scoreAfter } = await habitUtils.getHabitDetails(habit);
          const pointsAdded =scoreAfter-scoreBefore;
          // totalScore += pointsAdded
          
          // await prisma.habit.update({
            //   where: { id: habit.id },
            //   data: {
              //     score: scoreAfter,
              //   },
              // });
              await prisma.habit.update({
                where: { id: habit.id },
                data: {
                  score: scoreAfter,
                },
              });
              
              // const pointsAdded = scoreAfter - scoreBefore;
              
              const totalScore = await prisma.habit.aggregate({
                _sum: { score: true },
                where: { userId },
              });
              
              console.log(totalScore)
              
          log = await prisma.log.update({
            where: { id: log.id },
            data: {
              habit_score: scoreAfter,
              total_score: totalScore._sum.score,
              points_added: pointsAdded,
            },
          });
        }
      }
    }
    return totalScore
  }

  // Create habits
  const habits = [
    {
      name: "Daily Habit - once per day",
      image: "☎️",
      frequency: 1,
      color: "red",
      period: "day",
    },
    {
      name: "Daily Habit - twice per day",
      image: "☎️",
      frequency: 2,
      color: "yellow",
      period: "day",
    },
    {
      name: "Weekly Habit - 4 times per week",
      image: "⭐️",
      frequency: 4,
      color: "green",
      period: "week",
    },
    {
      name: "Weekly Habit - 7 times per week",
      image: "⭐️",
      frequency: 7,
      color: "red",
      period: "week",
    },
    {
      name: "Monthly Habit",
      image: "🤡",
      frequency: 3,
      color: "blue",
      period: "month",
    },
    {
      name: "Yearly Habit",
      image: "📸",
      frequency: 6,
      color: "violet",
      period: "year",
    },
  ];

  for (const habit of habits) {
    const createdHabit = await prisma.habit.create({
      data: {
        ...habit,
        userId,
      },
    });

    let requiredLogs = 0;

    if (habit.period === "day") {
      requiredLogs = 90 * habit.frequency; // Generate logs for the past 90 days
    } else if (habit.period === "week") {
      requiredLogs = 52 * habit.frequency; // Assuming 52 weeks in a year
    } else if (habit.period === "month") {
      requiredLogs = 12 * habit.frequency; // Assuming 12 months in a year
    } else if (habit.period === "year") {
      requiredLogs = habit.frequency;
    }

    await generateLogs(createdHabit, requiredLogs);

    const habitWithDetails = await habitUtils.getHabitDetails(createdHabit);

    await prisma.habit.update({
      where: { id: habitWithDetails.id },
      data: {
        score: habitWithDetails.score,
      },
    });
  }

  console.log("Seed completed successfully!");
  console.timeEnd("Seed time");
}

// Run the seed function
seed()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    // Disconnect Prisma Client
    await prisma.$disconnect();
  });
