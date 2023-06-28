import { Log } from "@/lib/types";
import clsx from "clsx";

interface LogsCalendarProps {
  logs?: { [day: string]: { [event: string]: number } } | null;
  className?: string;
}

export default function LogsCalendar({ logs, className }: LogsCalendarProps) {
  return (
    <div className={clsx("grid grid-rows-4 grid-cols-7 gap-4", className)}>
      {logs
        ? Object.keys(logs)
            .reverse()
            .map((item) => {
              return (
                <div key={item} className="flex flex-col items-center gap-1">
                  <div
                    className={clsx(
                      logs[item].done === 0 || logs[item].skipped != 0
                          ? "bg-white"
                        : "bg-[#79EC93]",
                      "w-8 aspect-square shadow-inner rounded-full place-self-center  flex items-center justify-center text-white font-semibold"
                    )}
                  >
                    {logs[item].skipped != 0
                      ? "❌"
                      : null}
                      {logs[item].done && logs[item].skipped === 0 
                        ? logs[item].done
                        : null}
                  </div>
                  <span className="text-[10px] text-center text-slate-400">
                    {new Date(item).toLocaleDateString("en-gb", {
                      day: "numeric",
                      month: "numeric",
                    })}
                  </span>
                </div>
              );
            })
        : null}
    </div>
  );
}
