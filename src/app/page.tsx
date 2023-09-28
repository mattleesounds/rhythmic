import Image from "next/image";
import GameCanvas from "./components/GameCanvas";
import type { Metadata } from "next";
import Mobile from "./components/Mobile";
import Footer from "./components/Footer";

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
      <main className="bg-slate-100 h-screen w-full flex justify-center">
        <div className="max-w-[1240px]">
          <div className="flex-1 flex flex-col items-center">
            <Image
              src={"/images/2.png"}
              alt="GroovTap"
              width={200}
              height={200}
              className="mt-8 mb-4"
            />
            <div className="flex justify-center mb-24">
              <GameCanvas />
            </div>
          </div>
          <Footer />
        </div>
      </main>
    );
  }
}
