"use client";
import React, { useEffect, useState } from "react";
import { AuthContextType, useAuth } from "@/components/AuthContext";

import { Habit } from "@/lib/types";
import HabitCard from "@/components/HabitCard";
import HabitForm from "@/components/HabitForm";
import clsx from "clsx";

export default function Page() {
  const { currentUser } = useAuth() as AuthContextType;
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function getHabits() {
      setLoading(true);
      const token = await currentUser?.getIdToken();
      if (!token) return setLoading(false);

      const headers = new Headers({
        Authorization: `Bearer ${token}`,
      });

      const res = await fetch(`http://localhost:3000/habits`, {
        headers,
      });

      if (!res.ok) return setLoading(false);

      console.log(token);

      const resJson = (await res.json()) as Habit[];
      setHabits(
        resJson.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
      setLoading(false);
    }

    getHabits();
  }, [currentUser]);

  console.log(habits);

  if (loading) return "Loading";

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 z-50 bg-white/50 backdrop-blur-md flex items-center justify-center",
          !formOpen && "hidden"
        )}
      >
        <HabitForm
          setOpen={setFormOpen}
          setHabits={setHabits}
          className={clsx(
            "mb-4 bg-white w-full max-w-3xl overflow-hidden rounded-xl flex flex-col"
          )}
        />
      </div>
      <div className="w-full max-w-4xl text-zinc-800">
        <h1 className="text-4xl font-serif font-bold">Today&apos;s tasks</h1>
        <p className="text-zinc-500">You have {habits?.length} tasks left for today</p>
      </div>
      <div className="w-full max-w-4xl grid gap-4 grid-cols-2">
        {!formOpen ? (
          <button
            className="button self-end justify-self-end  col-span-full w-fit"
            onClick={() => {
              setFormOpen(true);
            }}
          >
            Add habit
          </button>
        ) : null}
        {!!habits
          ? habits?.map((habit) => <HabitCard key={habit.id} habit={habit} />)
          : "no habits"}
      </div>
    </>
  );
}
