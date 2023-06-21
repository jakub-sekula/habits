"use client";
import React, { useEffect } from "react";
import { useAuth, AuthContextType } from "@/components/AuthContext";
import { useRouter } from "next/navigation";

export default function Page() {
  const { currentUser } = useAuth() as AuthContextType;

  const router = useRouter();
  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    }
  });
  if (!currentUser) return null;
  return <div>Trackers</div>;
}
