"use client";
import { useAuth, AuthContextType } from "@/components/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function Home() {
  const { currentUser } = useAuth() as AuthContextType;
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) return router.push("/login");
    return router.push("/habits");
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = currentUser && (await currentUser.getIdToken());
        if (!token) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
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
