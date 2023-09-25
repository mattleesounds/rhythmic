import Image from "next/image";
import GameCanvas from "./components/GameCanvas";
import type { Metadata } from "next";

/* export const metadata: Metadata = {
  title: "...",
  description: "...",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
}; */
export default function Home() {
  console.log("Home");
  return (
    <main className="bg-slate-200">
      <h1 className="flex justify-center p-16">Rhythmic</h1>
      <div className="flex justify-center">
        <GameCanvas />
      </div>
    </main>
  );
}
