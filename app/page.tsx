
export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <main>
          <h1 className="text-5xl text-center font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            LOOP is now live 🚀
          </h1>
          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Day 1 — Next.js + TypeScript + Tailwind + PostgreSQL
          </p>
        </main>
      </main>
    </div>
  );
}
