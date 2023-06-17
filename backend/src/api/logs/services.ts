import { PrismaClient, Log } from "@prisma/client";
const prisma = new PrismaClient();

interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const queryLogs = async <Key extends keyof Log>(
  filter: object,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: "asc" | "desc";
  },
  keys: Key[] = ["id", "event", "habitId", "createdAt", "points_added", "habit_score", "total_score"] as Key[]
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
  queryLogs,
};
