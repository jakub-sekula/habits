import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen max-w-5xl mx-auto flex-col items-center py-12 px-4">
      {children}
    </main>
  );
}
