import BuilderPage from "@/features/builder/BuilderPage";

export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-8">
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Elite Builder Lab
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Configurable basketball player builder inspired by pro-hoops
            gameplay. Not affiliated with or endorsed by the NBA or 2K.
          </p>
        </div>
      </header>
      <BuilderPage />
    </main>
  );
}

