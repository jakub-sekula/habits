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
  completed_for_period: boolean;
}


export interface Log {
  id: string;
  event: string;
  createdAt: Date;
  points_added: number;
  habit_score: number;
  total_score: number;
  habit?: Habit | null;
  habitId?: string | null;
  user: User;
  userId: string;
  points: Points[];
}

export interface User {
  uid: string;
  username?: string | null;
  email?: string | null;
  image?: string | null;
  createdAt: Date;
  habits: Habit[];
  logs: Log[];
  points: Points[];
}

export interface Points {
  id: string;
  log: Log;
  logId: string;
  points_added: number;
  total_score: number;
  user: User;
  userId: string;
}
