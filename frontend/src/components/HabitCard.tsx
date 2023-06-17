import { Habit } from "@/lib/types";
import { AuthContextType, useAuth } from "./AuthContext";
import clsx from "clsx";
import { useState } from "react";

export default function HabitCard({
  habit,
  setHabits,
  setSelected,
  setShowDetails,
}: {
  habit: Habit;
  setHabits?: Function;
  setSelected?: Function;
  setShowDetails?: Function;
}) {
  const { currentUser } = useAuth() as AuthContextType;
  const [pressed, setPressed] = useState<Boolean>(false);
  const {
    id,
    name,
    color,
    image,
    currentStreak,
    streakActive,
    progressString,
    completed_for_period,
  } = habit as Habit;

  async function logHabit() {
    try {
      const token = currentUser && (await currentUser.getIdToken());
      if (!token) throw Error("Not authorized");
      const res = await fetch(`http://localhost:3000/logs?habitId=${id}`, {
        method: "POST",
        headers: new Headers({
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        }),
      });
      const json = await res.json();
      if (typeof setHabits === "function") {
        setHabits((prev: Habit[]) => {
          return prev.map((habit) => {
            if (habit.id === json.habit.id) {
              return json.habit;
            } else {
              return habit;
            }
          });
        });
      }
      console.log(`Logged entry for habit '${json.habit.name}'\n`, json);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div
      onClick={() => {
        if (typeof setSelected === "function") {
          setSelected(habit);
        }
        if (typeof setShowDetails === "function") {
          console.log("imma show you")
          setShowDetails(true);
        }
      }}
      onMouseDown={() => {
        setPressed(true);
      }}
      onMouseUp={() => {
        setPressed(false);
      }}
      className={clsx(
        !!color && colors?.[color] ? colors[color] : "bg-red-200",
        // habit.completed_for_period ? 'opacity-50' : null,
        `w-full p-4 flex flex-col gap-8 rounded-lg hover:scale-[101%] transition-all duration-75`,
        pressed ? "hover:scale-[100%]" : null
      )}
    >
      <div className="flex gap-4">
        <div className="w-12 h-12 text-2xl mr-auto rounded-full bg-white flex items-center justify-center">
          {image}
        </div>
        <button
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            logHabit();
          }}
          className="w-8 h-8 rounded-md bg-white flex items-center justify-center"
        >
          +
        </button>
      </div>
      <div className="flex flex-col justify-end mt-auto">
        <div className="flex gap-2">
          {streakActive && currentStreak > 0 && (
            <span className="bg-black/50 p-1 w-fit leading-none rounded-sm text-white text-sm">
              🔥 {currentStreak}
            </span>
          )}
        </div>
        <h2 className="text-2xl font-bold capitalize text-white ">{name}</h2>
        <p className="text-white text-sm">{progressString}</p>
      </div>
    </div>
  );
}

const colors: { [key: string]: string } = {
  red: "red-gradient",
  orange: "orange-gradient",
  yellow: "yellow-gradient",
  green: "green-gradient",
  blue: "blue-gradient",
  indigo: "indigo-gradient",
  violet: "violet-gradient",
};
