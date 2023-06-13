export interface Habit {
  id: string;
  name: string;
  frequency: number;
  period: string;
  weekdays?: string;
  color?: string;
  image?: string;
  reminder: boolean;
  streakInterval: number;
  createdAt: Date;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  streakActive: boolean;
  streakExpiresTimestamp?: number | null;
  streakExpires?: string | null;
  progressString?: string;
  logsCount: number;
  score: number;
  multiplier: number | null;
  archived: boolean
}

export interface Log {
  id: string;
  event: string;
  createdAt: Date;
  habit?: Habit;
  habitId?: string;
}
