import { Habit, Log } from "@/lib/types";
import { AuthContextType, useAuth } from "./AuthContext";
import { useEffect, useState } from "react";

export default function HabitCard({
  habit,
  setHabits,
}: {
  habit: Habit;
  setHabits: Function;
}) {
  const { currentUser } = useAuth() as AuthContextType;
  const [logs, setLogs] = useState<Log[] | null>(null);
  const {
    name,
    id,
    color,
    image,
    period,
    frequency,
    streakInterval,
    multiplier,
    currentStreak,
    longestStreak,
    streakActive,
    createdAt,
    score,
    progressString,
    logsCount,
  } = habit;

  async function logHabit() {
    try {
      const token = currentUser && (await currentUser.getIdToken());
      if (!token) throw Error("Not authorized");
      const res = await fetch(`http://localhost:3000/habits/${id}/logs`, {
        method: "POST",
        headers: new Headers({
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        }),
      });
      const json = await res.json();
      setHabits((prev: Habit[]) => {
        return prev.map((habit) => {
          if (habit.id === json.habit.id) {
            return json.habit;
          } else {
            return habit;
          }
        });
      });
      console.log(`Logged entry for habit '${json.habit.name}'\n`, json);
    } catch (e) {
      console.log(e);
    }
  }

  async function deleteHabit() {
    try {
      const token = currentUser && (await currentUser.getIdToken());
      if (!token) throw Error("Not authorized");
      const res = await fetch(`http://localhost:3000/habits/${id}`, {
        method: "DELETE",
        headers: new Headers({
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        }),
      });
      const json = await res.json();
      setHabits((prev: Habit[]) => {
        return prev.filter((habit) => habit.id != json.id);
      });
      console.log(`Deleted habit '${json.name}'\n`, json);
    } catch (e) {
      console.log(e);
    }
  }

  async function archiveHabit() {
    try {
      const token = currentUser && (await currentUser.getIdToken());
      if (!token) throw Error("Not authorized");
      const res = await fetch(`http://localhost:3000/habits/${id}`, {
        method: "PUT",
        headers: new Headers({
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        }),
        body: JSON.stringify({ archived: true }),
      });
      const json = await res.json();
      setHabits((prev: Habit[]) => {
        return prev.filter((habit) => habit.id != json.id);
      });
      console.log(`Archived habit '${json.name}'\n`, json);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div
      className={`w-full ${
        !!color && colors?.[color] ? colors[color] : "bg-red-200"
      } p-4 flex flex-col gap-8 rounded-lg`}
    >
      <div className="flex gap-4">
        <div className="w-8 h-8 mr-auto rounded-full bg-white flex items-center justify-center">
          {image}
        </div>
        <button
          onClick={() => {
            logHabit();
          }}
          className="w-8 h-8 rounded-md bg-white flex items-center justify-center"
        >
          +
        </button>
        <button
          onClick={() => {
            deleteHabit();
          }}
          className="w-fit h-8 rounded-md bg-white flex items-center justify-center"
        >
          delete
        </button>
        <button
          onClick={() => {
            archiveHabit();
          }}
          className="w-fit h-8 rounded-md bg-white flex items-center justify-center"
        >
          archive
        </button>
      </div>
      <div className="flex flex-col justify-end mt-auto">
        <div className="flex gap-2">
          {currentStreak > 0 && (
            <span className="bg-black/50 p-1 w-fit leading-none rounded-sm text-white text-sm">
              🔥 {currentStreak}
            </span>
          )}
          {longestStreak > 0 && (
            <span className="bg-black/50 p-1 w-fit leading-none rounded-sm text-white text-sm">
              🏆 {longestStreak} {period}s
            </span>
          )}
          {!!score && (
            <span className="bg-black/50 p-1 w-fit leading-none rounded-sm text-white text-sm">
              🏅 {Math.floor(score)}
            </span>
          )}
          {!!multiplier && (
            <span className="bg-black/50 p-1 w-fit leading-none rounded-sm text-white text-sm">
              🪩 {multiplier.toFixed(2)}x
            </span>
          )}
        </div>
        <h2 className="text-2xl font-bold capitalize text-white ">{name}</h2>
        <p className="text-white text-sm">{progressString}</p>
        <p className="text-white text-xs">{id}</p>
        <p className="text-white text-xs">{logsCount} total logs</p>
      </div>
    </div>
  );
}

const colors: { [key: string]: string } = {
  red: "peer-checked:bg-red-500 bg-red-300",
  orange: "peer-checked:bg-orange-500 bg-orange-300",
  yellow: "peer-checked:bg-yellow-500 bg-yellow-300",
  green: "peer-checked:bg-green-500 bg-green-300",
  blue: "peer-checked:bg-blue-500 bg-blue-300",
  indigo: "peer-checked:bg-indigo-500 bg-indigo-300",
  violet: "peer-checked:bg-violet-500 bg-violet-300",
};
