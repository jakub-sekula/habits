export interface Habit {
  id: number;
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
  streakExpiresTimestamp: number | null;
  streakExpires: string | null;
}
