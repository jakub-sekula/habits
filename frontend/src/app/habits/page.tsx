"use client";
import React, { useEffect, useState } from "react";
import { AuthContextType, useAuth } from "@/components/AuthContext";
import LogChart from "@/components/LineChart";
import { Habit } from "@/lib/types";
import HabitCard from "@/components/HabitCard";
import HabitForm from "@/components/HabitForm";
import clsx from "clsx";
import HabitDetails from "@/components/HabitDetails";
import { useRouter } from "next/navigation";

export default function Page() {
  const { currentUser } = useAuth() as AuthContextType;
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [selected, setSelected] = useState<Habit | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login");
    }
  });
  // habit fetching
  useEffect(() => {
    async function getHabits() {
      setLoading(true);
      const token = await currentUser?.getIdToken();
      if (!token) {
        setHabits(null);
        return setLoading(false);
      }
      const headers = new Headers({
        Authorization: `Bearer ${token}`,
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/habits`, {
        headers,
      });

      if (!res.ok) return setLoading(false);

      console.log(token);

      const resJson = (await res.json()) as any;
      let habits: Habit[] = resJson.habits;
      let { currentPage, totalPages } = resJson.metadata;
      if (totalPages != 1) {
        while (currentPage <= totalPages) {
          const nextPageRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/habits?page=${currentPage + 1}`,
            {
              headers,
            }
          );

          if (nextPageRes.ok) {
            const nextPageJson = await nextPageRes.json();
            habits = [...habits, ...nextPageJson.habits];
            currentPage = nextPageJson.metadata.currentPage;
          } else {
            break;
          }
        }
      }
      setHabits(
        habits
          .filter((habit: Habit) => !habit.archived)
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      );
      setLoading(false);
    }

    getHabits();
  }, [currentUser]);

  //   habits?.sort((a, b) => {
  //     // if (a.completed_for_period && !b.completed_for_period) {
  //     //     return 1; // a comes after b
  //     // } else if (!a.completed_for_period && b.completed_for_period) {
  //     //     return -1; // a comes before b
  //     // } else {
  //         // Sort alphabetically when completed status is the same
  //         return a.name.localeCompare(b.name);
  //     // }
  // });

  const totalScore = habits?.reduce((score, habit) => {
    return score + habit.score;
  }, 0) as number;

  if (!currentUser) return null;

  return (
    <>
      {modalOpen ? (
        <div
          className={clsx(
            "fixed inset-0 z-50 bg-white/50 backdrop-blur-md flex items-center justify-center",
            !modalOpen && "hidden"
          )}
        >
          <HabitForm
            setOpen={setModalOpen}
            setHabits={setHabits}
            className={clsx(
              "mb-4 bg-white w-full max-w-3xl overflow-hidden rounded-xl flex flex-col"
            )}
          />
        </div>
      ) : null}
      {selected && showDetails ? (
        <div
          className={clsx(
            "fixed inset-0  z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center",
            !showDetails && "hidden"
          )}
        >
          <HabitDetails
            setHabits={setHabits}
            setShowDetails={setShowDetails}
            key={selected.id}
            habit={selected}
            className={clsx(
              " w-full max-w-3xl overflow-hidden rounded-xl flex flex-col"
            )}
          />
        </div>
      ) : null}

      <div className="w-full max-w-4xl text-zinc-800">
        <h1 className="text-4xl font-serif font-bold">Today&apos;s tasks</h1>
        <p className="text-zinc-500">
          You have{" "}
          {habits?.filter((habit) => !habit.completed_for_period).length} tasks
          left for today
        </p>
        <p className="text-zinc-500">Total score {Math.floor(totalScore)} 🏆</p>
        <p className="text-zinc-500">show deets {showDetails} 🏆</p>
        <p className="text-zinc-500">
          Selected habit: {selected ? selected.id : null}
        </p>
      </div>
      <div className="w-full max-w-5xl grid gap-4 md:grid-cols-2">
        {!modalOpen ? (
          <button
            className="button self-end justify-self-end  col-span-full w-fit"
            onClick={() => {
              setModalOpen(true);
            }}
          >
            Add habit
          </button>
        ) : null}

        {!!habits
          ? habits?.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                setHabits={setHabits}
                setShowDetails={setShowDetails}
                setSelected={setSelected}
              />
            ))
          : null}
        {loading
          ? new Array(10).fill("").map((habit, index) => {
              return (
                <div
                  key={index}
                  className={`w-full bg-slate-50 h-[12.625rem] animate-pulse animato p-4 flex flex-col gap-8 rounded-lg`}
                ></div>
              );
            })
          : null}
      </div>
    </>
  );
}
