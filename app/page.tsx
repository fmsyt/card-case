import dynamic from "next/dynamic";

const Case = dynamic(() => import("./components/Case"), { ssr: false });

export default function Home() {
  return (
    <div className="container mx-auto">
      <div className="bg-slate-500 grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="bg-slate-200 flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <Case />
        </main>
      </div>
    </div>
  );
}
