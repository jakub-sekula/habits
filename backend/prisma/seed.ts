import { Habit } from "@prisma/client";

// Import the Prisma Client
const { PrismaClient } = require("@prisma/client");

// Create an instance of the Prisma Client
const prisma = new PrismaClient();

// Seed function
async function seed() {
  const userId = "H6Dmr9nLRqdGsrNTk6HhTSYw8IT2"; // Replace with the actual user ID

  // Delete all existing habits and logs
  await prisma.log.deleteMany();
  await prisma.habit.deleteMany();

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
          consecutiveMissedLogs = 0;
          await prisma.log.create({
            data: {
              event: "done",
              createdAt: logDate,
              habitId: habit.id,
            },
          });
        }
      }
    }
  }

  // Create habits
  const habits = [
    {
      name: "Daily Habit",
      image:"☎️",
      frequency: 2,
      color: "red",
      period: "day",
    },
    {
      name: "Weekly Habit",
      image:"⭐️",
      frequency: 4,
      color: "green",
      period: "week",
    },
    {
      name: "Monthly Habit",
      image:"🤡",
      frequency: 3,
      color: "blue",
      period: "month",
    },
    {
      name: "Yearly Habit",
      image:"📸",
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
  }

  console.log("Seed completed successfully!");
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
