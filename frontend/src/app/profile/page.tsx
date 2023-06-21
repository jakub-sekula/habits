"use client";
import { useAuth, AuthContextType } from "@/components/AuthContext";
import clsx from "clsx";
import { GoogleAuthProvider, linkWithPopup } from "firebase/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function Home() {
  const { currentUser } = useAuth() as AuthContextType;

  const router = useRouter();
  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = currentUser && (await currentUser.getIdToken());
        if (!token) return;
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

  if (!currentUser) return null;

  return (
    <>
      Profile
      {currentUser?.isAnonymous ? (
        <button
          onClick={() => {
            linkWithPopup(currentUser, new GoogleAuthProvider());
          }}
          className={clsx("button")}
        >
          Link accounts
        </button>
      ) : null}
      <pre className="max-w-3xl w-full break-words whitespace-break-spaces">
        {JSON.stringify(currentUser, null, 2)}
      </pre>
    </>
  );
}
