"use client";
import { useAuth, AuthContextType } from "@/components/AuthContext";
import Link from "next/link";
import { useEffect } from "react";
export default function Home() {
  const { currentUser, logout } = useAuth() as AuthContextType;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = currentUser && (await currentUser.getIdToken());
        if (!token) return
        const res = await fetch("http://api.habits.jakubsekula.com/", {
          headers: new Headers({
            Authorization: `Bearer ${token}`,
          }),
        });
        console.log(await res.json());
      } catch (e) {
        console.log(e);
      }
    };

    fetchData();
  }, [currentUser]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      Main page
    </main>
  );
}
