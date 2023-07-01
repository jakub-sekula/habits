import { Habit, Log } from "@/lib/types";
import { AuthContextType, useAuth } from "./AuthContext";
import clsx from "clsx";
import useClickOutside from "@/lib/useClickOutside";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./HabitDetails.module.css";
import LogsCalendar from "./LogsCalendar";
import LogsCalendarLoader from "./LogsCalendarLoader";

export default function HabitDetails({
  habit,
  setHabits,
  className,
  setShowDetails,
}: {
  habit: Habit;
  setHabits?: Function;
  setShowDetails?: Function;
  className?: string;
}) {
  const [currentHabit, setHabit] = useState<Habit>(habit);
  const [logs, setLogs] = useState<Log[] | null>(null);
  const [last28DaysLogs, setLast28DaysLogs] = useState<{
    [day: string]: { [event: string]: number };
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const ref = useClickOutside<HTMLDivElement>(() => {
    if (typeof setShowDetails === "function") {
      setShowDetails(false);
    }
  });

  const { currentUser } = useAuth() as AuthContextType;

  const age =
    Math.floor(
      (new Date().getTime() - new Date(habit.createdAt).getTime()) /
        (1000 * 24 * 60 * 60)
    ) + 1;

  useEffect(() => {
    setHabit(habit);
  }, [habit]);

  // logs fetching
  useEffect(() => {
    async function getLogs() {
      setLoading(true);
      const token = await currentUser?.getIdToken();
      if (!token) {
        setLogs(null);
        return setLoading(false);
      }
      const headers = new Headers({
        Authorization: `Bearer ${token}`,
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/logs?habitId=${currentHabit.id}&limit=7&sortBy=createdAt`,
        {
          headers,
        }
      );

      if (!res.ok) return setLoading(false);

      const resJson = await res.json();

      setLogs(resJson.logs);
      setLoading(false);
    }

    getLogs();
  }, [currentUser, currentHabit.id]);

  // last 28 days logs fetching
  useEffect(() => {
    async function getLast28DaysOfLogs() {
      // setLoading(true);
      const token = await currentUser?.getIdToken();
      if (!token) {
        return setLoading(false);
      }
      const headers = new Headers({
        Authorization: `Bearer ${token}`,
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/logs/last28days?habitId=${currentHabit.id}&limit=5000`,
        {
          headers,
        }
      );

      if (!res.ok) return setLoading(false);

      const resJson = (await res.json()) as any;
      setLast28DaysLogs(resJson);
      // setLoading(false);
    }

    getLast28DaysOfLogs();
  }, [currentUser, currentHabit.id, logs]);

  async function logHabit() {
    try {
      const token = currentUser && (await currentUser.getIdToken());
      if (!token) throw Error("Not authorized");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/logs?habitId=${currentHabit.id}`,
        {
          method: "POST",
          headers: new Headers({
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          }),
        }
      );
      const json = await res.json();
      setHabit((prev: Habit) => {
        if (prev.id === json.habit.id) {
          return json.habit;
        } else {
          return habit;
        }
      });
      if (logs) {
        setLogs([json, ...logs].slice(0, 7));
      }
      console.log(`Logged entry for habit '${json.habit.name}'\n`, json);
    } catch (e) {
      console.log(e);
    }
  }

  async function deleteHabit() {
    try {
      const token = currentUser && (await currentUser.getIdToken());
      if (!token) throw Error("Not authorized");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/habits/${currentHabit.id}`,
        {
          method: "DELETE",
          headers: new Headers({
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          }),
        }
      );
      const json = await res.json();
      if (typeof setShowDetails === "function") {
        setShowDetails(false);
      }
      if (typeof setHabits === "function") {
        setHabits((prev: Habit[]) =>
          prev.filter((habit) => habit.id != json.id)
        );
      }
      console.log(`Deleted habit '${json.name}'\n`, json);
    } catch (e) {
      console.log(e);
    }
  }

  async function archiveHabit() {
    try {
      const token = currentUser && (await currentUser.getIdToken());
      if (!token) throw Error("Not authorized");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/habits/${currentHabit.id}`,
        {
          method: "PUT",
          headers: new Headers({
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          }),
          body: JSON.stringify({ archived: true }),
        }
      );
      const json = await res.json();
      console.log(`Archived habit '${json.name}'\n`, json);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div
      ref={ref}
      className={clsx(
        className,
        styles.shadow,
        " bg-white flex flex-col h-max rounded-2xl overflow-hidden"
      )}
    >
      {/* header */}
      <section
        className={clsx(
          !!currentHabit.color && colors?.[currentHabit.color]
            ? colors[currentHabit.color]
            : "bg-red-200",
          "p-6 w-full h-full relative"
        )}
      >
        <div className="flex w-full gap-4 h-full items-end">
          <div className="w-[100px] h-[100px] rounded-full shrink-0 bg-white flex items-center justify-center text-5xl">
            {currentHabit.image}
          </div>
          <div className="flex flex-col w-full">
            {currentHabit.streakActive && currentHabit.currentStreak > 0 && (
              <span className="bg-black/50 p-1 w-fit leading-none rounded-sm text-white text-sm">
                🔥 {currentHabit.currentStreak}
              </span>
            )}
            <h2 className="text-4xl font-bold capitalize line-clamp-1">
              {currentHabit.name}
            </h2>
            <p className="">{currentHabit.progressString}</p>
          </div>
          <div className="flex flex-col h-full items-end justify-between">
            <button
              className="absolute top-4 right-4"
              onClick={() => {
                if (typeof setShowDetails === "function") {
                  setShowDetails(false);
                }
              }}
            >
              <BsX size={28} />
            </button>
            <button
              onClick={() => {
                logHabit();
              }}
              className="w-12 h-12 active:opacity-75 active:scale-95 transition-all duration-75 hover:shadow-inner shadow-black text-5xl font-semibold leading-none rounded-md bg-white flex items-center justify-center text-black"
            >
              <BsPlus size={64} className="text-orange-600" />
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="flex gap-2 w-full justify-between bg-[#fafafa] py-6 px-14 h-full">
        {currentHabit.streakActive && currentHabit.currentStreak > 0 ? (
          <Stat
            icon="🔥"
            title="Current streak"
            value={
              currentHabit.currentStreak > 1
                ? `${currentHabit.currentStreak} ${habit.period}s`
                : `${currentHabit.currentStreak} ${habit.period}`
            }
          />
        ) : (
          <Stat icon="🔥" title="Current streak" value={0} />
        )}
        {currentHabit.longestStreak > 0 ? (
          <Stat
            icon="🏆"
            title="Longest streak"
            value={`${currentHabit.longestStreak} ${currentHabit.period}s`}
          />
        ) : (
          <Stat icon="🏆" title="Longest streak" value={0} />
        )}
        {!!currentHabit.score ? (
          <Stat
            icon="⭐️"
            title="Points earned"
            value={Math.floor(currentHabit.score)}
          />
        ) : (
          <Stat icon="⭐️" title="Points earned" value={0} />
        )}
        {!!currentHabit.multiplier ? (
          <Stat
            icon="⚡️"
            title="Points multiplier"
            value={`${currentHabit.multiplier.toFixed(2)}x`}
          />
        ) : (
          <Stat icon="⚡️" title="Points multiplier" value="1.00x" />
        )}
      </div>

      {/* TODO frequency and period */}

      {/* Calendar and logs */}
      <div className="flex gap-8 p-8">
        <div className="flex flex-col w-full h-fit">
          <div className="flex w-full justify-between items-baseline leading-none mb-4">
            <h3 className="font-semibold">Last 28 days</h3>
            <Link href="#" className="text-xs hover:underline text-slate-500">
              View all
            </Link>
          </div>
          {loading ? (
            <LogsCalendarLoader />
          ) : (
            <LogsCalendar className="w-full h-full" logs={last28DaysLogs} />
          )}
        </div>
        <div id="entries-history" className="flex h-80 flex-col w-full">
          <div className="flex w-full justify-between items-baseline leading-none mb-4">
            <h3 className="font-semibold">Entries history</h3>
            <Link href="#" className="text-xs hover:underline text-slate-500">
              View all
            </Link>
          </div>

          <ul className="flex flex-col gap-2">
            {loading
              ? Array(7)
                  .fill("d")
                  .map((log, index) => (
                    <li
                      key={`placeholder-log-${index}`}
                      className="flex gap-4 pb-2 items-center h-8 bg-slate-50 animate-pulse rounded-md"
                    ></li>
                  ))
              : logs?.map((log) => <LogEntry log={log} key={log.id} />)}
          </ul>
        </div>
      </div>

      <div className="flex p-8 pt-0 w-full">
        <div className="flex flex-col mr-auto text-neutral-500">
          <p title={currentHabit.id} className=" text-xs mt-auto">
            Tracking for {age} {age === 1 ? "day" : "days"}
          </p>
          <p className=" text-xs">
            Habit added on{" "}
            {new Date(habit.createdAt).toLocaleDateString("en-gb", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={() => {
            deleteHabit();
          }}
          className="rounded-md hover:underline flex items-center justify-center text-black"
        >
          delete
        </button>
        <button
          onClick={() => {
            archiveHabit();
          }}
          className="w-fit h-8 rounded-md bg-white flex items-center justify-center text-black"
        >
          archive
        </button>
      </div>
    </div>
  );
}

interface StatProps {
  icon: string;
  title: string;
  value: string | number | null;
}

const Stat: React.FC<StatProps> = ({ icon, title, value }) => {
  return (
    <div className="flex gap-2">
      <span className="text-4xl">{icon}</span>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm leading-none">{title}</h3>
        <span className="text-2xl font-bold leading-none">{value}</span>
      </div>
    </div>
  );
};

interface LogEntryProps {
  log: Log;
}

import { BsPlus, BsTrash, BsX } from "react-icons/bs";

const LogEntry: React.FC<LogEntryProps> = ({ log }) => {
  return (
    <li className="flex gap-4 pb-2 border-b items-center">
      <h4 className="w-full text-xs">
        {formatTimestamp(new Date(log.createdAt).getTime())}
      </h4>
      <span className="text-xs py-[0.125rem] flex items-center justify-center px-2 rounded-md border border-slate-200 text-slate-500">
        {log.event.toUpperCase()}
      </span>
      <button>
        <BsTrash size={16} className="text-[#9A9A9A]" />
      </button>
    </li>
  );
};

function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  const formattedDate = date.toLocaleDateString("en", {
    day: "numeric",
    month: "short",
  });
  const formattedTime = date.toLocaleTimeString("en", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formattedDate}, ${formattedTime}`;
}

const colors: { [key: string]: string } = {
  red: "red-gradient text-white",
  orange: "orange-gradient text-white",
  yellow: "yellow-gradient text-[#5E2B06]",
  green: "green-gradient text-white",
  blue: "blue-gradient text-white",
  indigo: "indigo-gradient text-white",
  violet: "violet-gradient text-white",
  pink: "pink-gradient text-white",
};

const little_button =
  "w-fit h-8 rounded-md bg-white flex items-center justify-center";
