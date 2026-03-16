"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-6 px-6 py-8">
      <div className="card max-w-lg p-6">
        <h2 className="text-xl font-semibold text-red-400">Something went wrong</h2>
        <p className="mt-2 text-sm text-slate-400">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
