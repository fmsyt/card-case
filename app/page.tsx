import dynamic from "next/dynamic";

const Case = dynamic(() => import("./components/Case"), { ssr: false });

export default function Home() {
  return (
    <div id="__next" className="container board">
      <div className="h-[100svh]  grid grid-rows-1fr items-center justify-items-center font-[family-name:var(--font-geist-sans)]">
        <Case />
      </div>
    </div>
  );
}
