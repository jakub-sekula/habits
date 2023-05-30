"use client";
import { useAuth, AuthContextType } from "@/components/AuthContext";
import Link from "next/link";
import { useEffect } from "react";
export default function Home() {
  const { currentUser, logout } = useAuth() as AuthContextType;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = currentUser;
        const token = user && (await user.getIdToken());
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
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      Main page
      <br />
      Current user:
      {currentUser ? (
        <button
        className="bg-green-200 px-4 py-1 rounded-md"
          onClick={() => {
            logout();
          }}
        >
          logout 
        </button>
      ) : <Link className="bg-green-200 px-4 py-1 rounded-md" href="/login">Login</Link>}
      <pre className="max-w-3xl">{JSON.stringify(currentUser, null, 2)}</pre>
    </main>
  );
}
