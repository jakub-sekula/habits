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
        if (!token) return;
        const res = await fetch("http://localhost:3000/", {
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
    <>
      Profile
      <pre className="max-w-3xl w-full break-words whitespace-break-spaces">{JSON.stringify(currentUser, null, 2)}</pre>
    </>
  );
}
