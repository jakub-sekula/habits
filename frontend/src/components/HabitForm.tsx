import * as Form from "@radix-ui/react-form";
import { useForm } from "react-hook-form";
import styles from "./HabitForm.module.css";

import clsx from "clsx";
import { AuthContextType, useAuth } from "./AuthContext";
import { Habit } from "@/lib/types";
import { useState } from "react";

import useClickOutside from "@/lib/useClickOutside";
import { BsX } from "react-icons/bs";

type FormData = {
  image?: string;
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
  const ref = useClickOutside<HTMLFormElement>(() => setOpen(false));

  const [color, setColor] = useState<string>("blue");
  const { register, handleSubmit, reset, getValues } = useForm<FormData>({
    defaultValues: {
      weekdays: [],
      color: "indigo",
      image: "🏆",
    },
  });
  const { currentUser } = useAuth() as AuthContextType;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const token = currentUser && (await currentUser.getIdToken());
      if (!token) throw Error("Not authorized");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/habits`, {
        method: "POST",
        headers: new Headers({
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        }),
        body: JSON.stringify(data),
      });
      console.log(data);
      const habit = await res.json();
      console.log("returned habit: ", habit);
      setHabits((prev: Habit[]) => [habit, ...prev]);
      reset();
      return setOpen(false);
    } catch (e) {
      console.log(e);
    }
  });

  return (
    <Form.Root
      onSubmit={onSubmit}
      className={clsx(
        className,
        styles.shadow,
        "w-full bg-white flex flex-col h-fit rounded-2xl overflow-clip"
      )}
      ref={ref}
    >
      {/* Header */}
      <div className={clsx("p-6 w-full h-full relative", colors[color])}>
        <div className="flex w-full gap-4 h-full items-center">
          {/* Emoji */}
          <Form.Field
            className="w-[100px] h-[100px] rounded-full shrink-0 bg-white flex items-center justify-center text-5xl"
            name="title"
          >
            <Form.Control asChild>
              <input
                {...register("image")}
                className="rounded-full w-24 h-24 bg-white text-4xl flex justify-center items-center text-center"
              />
            </Form.Control>
          </Form.Field>

          {/* Tile */}
          <Form.Field
            className="flex flex-col text-white font-semibold gap-1 w-full "
            name="name"
          >
            {/* <Form.Label>Habit title</Form.Label> */}
            <Form.Control asChild>
              <input
                required
                {...register("name")}
                placeholder="Habit title"
                className={clsx(
                  "bg-white/10 shadow-inner py-1 px-2 placeholder:text-white text-white text-4xl  rounded-md"
                )}
              />
            </Form.Control>
          </Form.Field>

          {/* Close */}
          <button
            className="absolute top-4 right-4"
            onClick={() => {
              if (typeof setOpen === "function") {
                setOpen(false);
              }
            }}
          >
            <BsX size={28} />
          </button>
        </div>
      </div>

      {/* Form fields */}
      <div className="flex flex-col w-full p-6 gap-6">
        {/* Weekdays */}
        <Form.Field name="weekdays" className="flex flex-col gap-2">
          <Form.Label className={styles.fieldLabel}>
            Preferred weekdays
          </Form.Label>
          <div className="flex gap-4 flex-wrap">
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
                min={0}
                defaultValue={1}
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

          <div className="flex justify-between md:justify-normal gap-4 flex-wrap">
            {Object.keys(colors).map((key) => (
              <ColorLabel
                key={`key-${key}`}
                setColor={setColor}
                value={key}
                register={register}
                checked={color === key}
              />
            ))}
          </div>
        </Form.Field>
        {/* <Form.Submit asChild> */}
        <button
          type="submit"
          className={clsx(
            "font-semibold px-4 py-2 w-fit self-end rounded-md text-sm",
            colors[color],
            textColors[color]
          )}
        >
          Add new habit
        </button>
        {/* </Form.Submit> */}
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
          className={`rounded-full w-full h-full aspect-square ${colors[value]} peer-checked:outline transition-colors duration-200`}
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
  red: "red-gradient text-white",
  orange: "orange-gradient text-white",
  yellow: "yellow-gradient text-[#5E2B06]",
  green: "green-gradient text-white",
  blue: "blue-gradient text-white",
  indigo: "indigo-gradient text-white",
  violet: "violet-gradient text-white",
  pink: "pink-gradient text-white",
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
