import Image from "next/image";
import GameCanvas from "./components/GameCanvas";

export default function Home() {
  return (
    <main>
      <h1 className="flex justify-center p-16">Rhythmic</h1>
      <div className="flex justify-center">
        <GameCanvas />
      </div>
    </main>
  );
}
