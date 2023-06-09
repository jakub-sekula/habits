import { Habit } from "@/lib/types";
export default function HabitCard({ habit }: { habit: Habit }) {
  const {
    name,
    id,
    color,
    image,
    period,
    frequency,
    streakInterval,
	currentStreak,
	streakActive,
    createdAt,
  } = habit;

  return (
    <div
      className={`w-full ${
        !!color && colors?.[color]
          ? colors[color]
          : "bg-red-200"
      } p-4 flex flex-col gap-8 rounded-lg`}
    >
		<div className="flex justify-between">
			<div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">{image}</div>
			<button className="w-8 h-8 rounded-md bg-white flex items-center justify-center">+</button>
		</div>
		<div className="flex flex-col gap-4 justify-end mt-auto">
		{currentStreak > 0 && <span className="bg-black/50 p-1 w-fit leading-none rounded-sm text-white text-sm">🔥 {currentStreak}</span> }
	  		<h2 className="text-2xl font-bold capitalize text-white ">{name}</h2>
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
