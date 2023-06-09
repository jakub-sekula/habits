import * as Form from "@radix-ui/react-form";
import { useForm } from "react-hook-form";
import styles from "./HabitForm.module.css";

import clsx from "clsx";
import { AuthContextType, useAuth } from "./AuthContext";
import { Habit } from "@/lib/types";
import { FormEvent, useEffect, useRef, useState } from "react";

type FormData = {
  image: string;
  name: string;
  color: string;
  frequency: number;
  period: string;
  weekdays: string[];
};

interface ChildComponentProps {
  className?: string;
  setHabits: Function;
  setOpen: Function;
}

export default function HabitForm({
  className,
  setHabits,
  setOpen,
}: ChildComponentProps) {
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setOpen]);

  const [color, setColor] = useState<string>("red");
  const { register, handleSubmit, reset } = useForm<FormData>();
  const { currentUser } = useAuth() as AuthContextType;
  const onSubmit = handleSubmit(async (data) => {
    console.log(data.color);
    try {
      const token = currentUser && (await currentUser.getIdToken());
      if (!token) throw Error("Not authorized");
      const res = await fetch("http://localhost:3000/habits", {
        method: "POST",
        headers: new Headers({
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        }),
        body: JSON.stringify(data),
      });
      const habit = await res.json();
      console.log("returned habit: ", habit);
      setHabits((prev: Habit[]) => [habit, ...prev]);
      reset()
      return setOpen(false) 
    } catch (e) {
      console.log(e);
    }
  });

  return (
    <Form.Root onSubmit={onSubmit} className={clsx(className, styles.shadow)} ref={ref}>
      <div
        className={clsx(
          "w-full h-full relative flex items-center p-6 gap-4",
          colors[color]
        )}
      >
        
        <Form.Field className="relative" name="title">
          {/* <Form.Label>Emoji</Form.Label> */}
          <Form.Control asChild>
            <input
              {...register("image")}
              className="rounded-full w-24 h-24 bg-white text-4xl flex justify-center items-center text-center"
            />
          </Form.Control>
        </Form.Field>
        <Form.Field
          className="flex flex-col text-white font-semibold gap-1 "
          name="name"
        >
          <Form.Label>Habit title</Form.Label>
          <Form.Control asChild>
            <input
              required
              {...register("name")}
              className="w-64 bg-white text-slate-800 py-2 px-3 rounded-md"
            />
          </Form.Control>
        </Form.Field>
        <button
        className="absolute top-4 right-4"
          onClick={() => {
            setOpen(false);
          }}
        >
          close
        </button>
      </div>
      <div className="flex flex-col w-full p-6 gap-6">
        {/* Weekdays */}
        <Form.Field name="weekdays" className="flex flex-col gap-2">
          <Form.Label className={styles.fieldLabel}>Weekdays</Form.Label>
          <div className="flex gap-4">
            <DayLabel day="Mon" register={register} />
            <DayLabel day="Tue" register={register} />
            <DayLabel day="Wed" register={register} />
            <DayLabel day="Thu" register={register} />
            <DayLabel day="Fri" register={register} />
            <DayLabel day="Sat" register={register} />
            <DayLabel day="Sun" register={register} />
          </div>
        </Form.Field>

        {/* Frequency and period */}
        <div className="flex w-full gap-4">
          <Form.Field className="relative flex flex-col gap-2" name="frequency">
            <Form.Label className={styles.fieldLabel}>Frequency</Form.Label>
            <Form.Control asChild>
              <input
                type="number"
                required
                {...register("frequency")}
                placeholder="2"
                className="w-full h-full border border-slate-200 text-slate-800 py-2 px-3 rounded-md"
              />
            </Form.Control>
          </Form.Field>
          <Form.Field name="period" className="flex flex-col gap-2">
            <Form.Label className={styles.fieldLabel}>Period</Form.Label>
            <Form.Control asChild>
              <select
                {...register("period")}
                className="w-full h-full border border-slate-200 text-slate-800 py-2 px-3 rounded-md"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </Form.Control>
          </Form.Field>
        </div>

        {/* Colors */}
        <Form.Field name="color" className="flex flex-col gap-2">
          <Form.Label className={styles.fieldLabel}>Color</Form.Label>

          <div className="flex gap-4">
            {Object.keys(colors).map((key) => (
              <ColorLabel
                key={`key-${key}`}
                setColor={setColor}
                value={key}
                register={register}
                checked={color===key}
              />
            ))}
          </div>
        </Form.Field>
        <Form.Submit asChild>
          <button
            className={clsx(
              "font-semibold px-4 py-2 w-fit self-end rounded-md text-sm",
              colors[color],
              textColors[color]
            )}
          >
            Add new habit
          </button>
        </Form.Submit>
      </div>
    </Form.Root>
  );
}

function ColorLabel({
  value,
  register,
  setColor,
  checked,
}: {
  value: string;
  register: Function;
  setColor: Function;
  checked?: boolean;
}) {
  return (
    <>
      <label htmlFor={value} className="w-12 h-12">
        <span className="hidden">{value}</span>
        <input
          type="radio"
          {...register("color")}
          value={value}
          checked={checked}
          id={value}
          className="peer hidden"
          onClick={() => {
            setColor(value);
          }}
        />
        <div
          className={`rounded-full w-full h-full bg-re-500 ${colors[value]} peer-checked:outline transition-colors duration-200`}
        />
      </label>
    </>
  );
}

function DayLabel({ day, register }: { day: string; register: Function }) {
  return (
    <label htmlFor={day} className="w-12 h-8 relative">
      <input
        type="checkbox"
        value={day}
        id={day}
        {...register("weekdays")}
        className="peer absolute w-px h-px opacity-0 top-0 left-0 "
      />

      <div
        className={`rounded-md text-slate-800 py-2 px-3  flex justify-center items-center w-full h-full bg-re-500 bg-white peer-checked:bg-slate-500 peer-checked:text-white peer-checked:border-slate-500 peer-focus-within:outline hover:bg-slate-50 select-none border border-slate-200`}
      >
        {day}
      </div>
    </label>
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
  amber: "peer-checked:bg-amber-500 bg-amber-300",
};

const textColors: { [key: string]: string } = {
  red: "text-red-900",
  orange: "text-orange-900",
  yellow: "text-yellow-900",
  green: "text-green-900",
  blue: "text-blue-900",
  indigo: "text-indigo-900",
  violet: "text-violet-900",
};
