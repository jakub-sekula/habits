"use client";
import Link from "next/link";

import { useAuth, AuthContextType } from "@/components/AuthContext";
import { useState } from "react";
import auth from "@/lib/auth";

export default function Page() {
  const { currentUser, login, logout } = useAuth() as AuthContextType;
  const [loading, setLoading] = useState(false);

  if (currentUser) {
    console.log(currentUser);
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: new Headers({
          Authorization: `Bearer ${token}`,
        }),
      });
      const json = await res.json();
      console.log("response from express: ", json);
    } catch (e) {
      console.log(e);
      alert("Failed to sign in");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-4 text-3xl text-center tracking-tight font-light dark:text-white">
            Login to your account
          </h2>
        </div>
        <form onSubmit={handleFormSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 placeholder-gray-500 rounded-t-md bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 placeholder-gray-500 rounded-t-md bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className=" w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-800 hover:bg-sky-900"
            >
              Login
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/register"
                className="text-blue-600 hover:underline dark:text-blue-500"
              >
                Dont have an account? Register
              </Link>
            </div>
          </div>
        </form>
        <div>
          {currentUser ? (
            <div>
              hello,{" "}
              <button
                onClick={() => {
                  logout();
                }}
              >
                logout {currentUser.email}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
