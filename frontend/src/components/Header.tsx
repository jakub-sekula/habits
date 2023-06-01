"use client";
import React from "react";
import { useAuth, AuthContextType } from "./AuthContext";
import Link from "next/link";

export default function Header() {
  const { currentUser, logout } = useAuth() as AuthContextType;
  return (
    <header>
      <Link href="/">Home</Link>
      <Link href="/login">Login</Link>
      <Link href="/register">Register</Link>
      <button
        className="text-black"
        onClick={() => {
          logout();
        }}
      >Logout</button>{" "}
      {currentUser ? `logged in as ${currentUser.displayName}` : "logged out"}
    </header>
  );
}
