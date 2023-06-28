import { Log } from "@/lib/types";
import clsx from "clsx";

export default function LogsCalendarLoader({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={clsx("grid grid-rows-4 grid-cols-7 gap-4", className)}>
      {Array(28)
        .fill(".")
        .map((item) => {
          return (
            <div key={item} className="flex flex-col items-center gap-1">
              <div
                className={clsx(
                  "w-8 aspect-square bg-slate-50 animate-pulse rounded-full place-self-center  flex items-center justify-center text-white font-semibold"
                )}
              ></div>
              <div className="h-[10px] mb-[6px] w-2/3 bg-slate-50 rounded-full animate-pulse"></div>
            </div>
          );
        })}
    </div>
  );
}
