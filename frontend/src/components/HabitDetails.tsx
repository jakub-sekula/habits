import { Habit, Log } from "@/lib/types";
import { AuthContextType, useAuth } from "./AuthContext";
import clsx from "clsx";
import useClickOutside from "@/lib/useClickOutside";
import { useEffect, useState } from "react";

export default function HabitDetails({
  habit,
  setOpen,
  className,
  setShowDetails,
}: {
  habit: Habit;
  setOpen?: Function;
  setShowDetails?: Function;
  className?: string;
}) {
  const [currentHabit, setHabit] = useState<Habit>(habit);
  const [logs, setLogs] = useState<Log[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const ref = useClickOutside<HTMLDivElement>(() => {
    if (typeof setShowDetails === "function") {
      setShowDetails(false);
    }
  });

  const { currentUser } = useAuth() as AuthContextType;
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
    completed_for_period,
  } = currentHabit;

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
        `http://localhost:3000/logs?habitId=${currentHabit.id}&limit=10&sortBy=createdAt`,
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
      setHabit((prev: Habit) => {
        if (prev.id === json.habit.id) {
          return json.habit;
        } else {
          return habit;
        }
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
      console.log(`Archived habit '${json.name}'\n`, json);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div
      ref={ref}
      className={clsx(
        // habit.completed_for_period ? 'opacity-25' : null,
        `w-[864px] bg-white flex flex-col h-fit rounded-lg overflow-hidden`
      )}
    >
      {/* header */}
      <section
        className={clsx(
          !!color && colors?.[color] ? colors[color] : "bg-red-200",
          "p-6 w-full h-full relative"
        )}
      >
        <div className="flex gap-4 absolute top-4 right-4">
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
        <div className="flex w-fit gap-4 h-full items-end">
          <div className="w-[100px] h-[100px] rounded-full shrink-0 bg-white flex items-center justify-center text-5xl">
            {image}
          </div>
          <div className="flex flex-col">
            {streakActive && currentStreak > 0 && (
              <span className="bg-black/50 p-1 w-fit leading-none rounded-sm text-white text-sm">
                🔥 {currentStreak}
              </span>
            )}
            <h2 className="text-4xl font-bold capitalize line-clamp-1">
              {name}
            </h2>
            <p className="">{progressString}</p>
          </div>
        </div>
      </section>
      {/* stats */}
      <div className="flex gap-2 w-full justify-between bg-[#fafafa] py-6 px-8 h-full">
        {streakActive && currentStreak > 0 ? (
          <Stat icon="🔥" title="Current streak" value={currentStreak} />
        ) : (
          <Stat icon="🔥" title="Current streak" value={0} />
        )}
        {longestStreak > 0 ? (
          <Stat
            icon="🏆"
            title="Longest streak"
            value={`${longestStreak} ${period}s`}
          />
        ) : (
          <Stat icon="🏆" title="Longest streak" value={0} />
        )}
        {!!score ? (
          <Stat icon="⭐️" title="Points earned" value={Math.floor(score)} />
        ) : (
          <Stat icon="⭐️" title="Points earned" value={0} />
        )}
        {!!multiplier ? (
          <Stat
            icon="⚡️"
            title="Points multiplier"
            value={`${multiplier.toFixed(2)}x`}
          />
        ) :  <Stat
        icon="⚡️"
        title="Points multiplier"
        value="1.00x"
      />}
      </div>
      {/* rest */}
      <ul className="bg-red-500">
        {logs?.map((log) => (
          <li key={log.id}>{log.id}</li>
        ))}
      </ul>
      <p className=" text-xs">{id}</p>
      <p className=" text-xs">{logsCount} total logs</p>
    </div>
  );
}

const colors: { [key: string]: string } = {
  red: "red-gradient text-white",
  orange: "orange-gradient text-white",
  yellow: "yellow-gradient text-[#5E2B06]",
  green: "green-gradient text-white",
  blue: "blue-gradient text-white",
  indigo: "indigo-gradient text-white",
  violet: "violet-gradient text-white",
};

const little_button =
  "w-fit h-8 rounded-md bg-white flex items-center justify-center";

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
