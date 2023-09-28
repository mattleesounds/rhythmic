import Image from "next/image";
import GameCanvas from "./components/GameCanvas";
import type { Metadata } from "next";
import Mobile from "./components/Mobile";

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
  const isMobile = () => {
    if (typeof window !== "undefined") {
      return /Mobi|Android/i.test(window.navigator.userAgent);
    }
    return false;
  };
  if (isMobile()) {
    return <Mobile />;
  } else {
    return (
      <main className="bg-slate-100 flex flex-col items-center h-full">
        <Image
          src={"/images/2.png"}
          alt="GroovTap"
          width={200}
          height={200}
          className="mt-8 mb-4"
        />
        <div className="flex justify-center pb-64">
          <GameCanvas />
        </div>
      </main>
    );
  }
}
