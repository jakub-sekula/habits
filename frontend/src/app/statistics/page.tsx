"use client";
import React, { useEffect, useState } from "react";
import { AuthContextType, useAuth } from "@/components/AuthContext";
import LogChart from "@/components/LineChart";
import { useRouter } from "next/navigation";

export default function Page() {
  const { currentUser } = useAuth() as AuthContextType;
  const [loading, setLoading] = useState<boolean>(true);
  const [logs, setLogs] = useState<any>([]);
  const router = useRouter();
  useEffect(() => {
    if(!loading && !currentUser) {
      router.push("/login")
    }
  });

  // logs fetching
  useEffect(() => {
    async function getLogs() {
      setLoading(true);
      const token = await currentUser?.getIdToken();
      if (!token) {
        setLogs(null);
        return setLoading(false);
      }
      const headers = new Headers({
        Authorization: `Bearer ${token}`,
      });

      const res = await fetch(
        `http://api.habits.jakubsekula.com/logs?limit=1000&sortBy=createdAt`,
        {
          headers,
        }
      );

      if (!res.ok) return setLoading(false);

      console.log(token);

      const resJson = (await res.json()) as any;
      let logs: any = resJson.logs;
      let { currentPage, totalPages } = resJson.metadata;
      if (totalPages != 1) {
        while (currentPage < totalPages) {
          const nextPageRes = await fetch(
            `http://api.habits.jakubsekula.com/logs?page=${
              currentPage + 1
            }&limit=1000&sortBy=createdAt`,
            {
              headers,
            }
          );

          if (nextPageRes.ok) {
            const nextPageJson = await nextPageRes.json();
            logs = [...logs, ...nextPageJson.logs];
            currentPage = nextPageJson.metadata.currentPage;
          } else {
            break;
          }
        }
      }
      setLogs(logs);
      setLoading(false);
    }

    getLogs();
  }, [currentUser]);

  return <>{!!logs && logs.length > 0 ? <LogChart logs={logs} /> : null}</>;
}
