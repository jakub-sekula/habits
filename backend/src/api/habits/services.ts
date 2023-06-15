import { PrismaClient, Habit, Log } from "@prisma/client";
const prisma = new PrismaClient();

interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * Query for habits
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryHabits = async <Key extends keyof Habit>(
  filter: object,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: "asc" | "desc";
  },
  keys: Key[] = [
    "id",
    "name",
    "frequency",
    "period",
    "weekdays",
    "color",
    "image",
    "reminder",
    "createdAt",
    "archived",
    "userId",
    "type",
  ] as Key[]
): Promise<{ habits: Pick<Habit, Key>[]; metadata: PaginationMetadata }> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? "desc";
  const [habits, totalCount] = await Promise.all([
    prisma.habit.findMany({
      where: filter,
      select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
      skip: (page - 1) * limit,
      take: limit,
      orderBy: sortBy ? { [sortBy]: sortType } : undefined,
    }),
    prisma.habit.count({ where: filter }),
  ]);
  const totalPages = Math.ceil(totalCount / limit);

  const metadata: PaginationMetadata = {
    currentPage: page,
    totalPages,
    totalItems: totalCount,
    itemsPerPage: limit,
  };

  return {  metadata, habits: habits as Pick<Habit, Key>[], };
};

const queryLogs = async <Key extends keyof Log>(
  filter: object,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: "asc" | "desc";
  },
  keys: Key[] = ["id", "event", "habitId", "createdAt"] as Key[]
): Promise<{ logs: Pick<Log, Key>[]; metadata: PaginationMetadata }> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 100;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? "desc";
  const [logs, totalCount] = await Promise.all([
    prisma.log.findMany({
      where: filter,
      select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
      skip: (page - 1) * limit,
      take: limit,
      orderBy: sortBy ? { [sortBy]: sortType } : undefined,
    }),
    prisma.log.count({ where: filter }),
  ]);
  const totalPages = Math.ceil(totalCount / limit);

  const metadata: PaginationMetadata = {
    currentPage: page,
    totalPages,
    totalItems: totalCount,
    itemsPerPage: limit,
  };

  return { metadata, logs: logs as Pick<Log, Key>[] };
};

export default {
  queryHabits,
  queryLogs,
};
