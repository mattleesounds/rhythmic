"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import Link from "next/link";
import Image from "next/image";

const Score = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const score: number = Number(searchParams.get("score"));
  let scoreCategory: string = "";

  if (score > 48) {
    scoreCategory = "Animal";
  } else if (score > 42 && score < 49) {
    scoreCategory = "Zigaboo";
  } else if (score > 36 && score < 43) {
    scoreCategory = "Ringo";
  } else if (score < 37) {
    scoreCategory = "Flanders";
  }
  console.log("Score", score, scoreCategory);

  const imageSrcMap: any = {
    Animal: "/images/animal.jpg",
    Zigaboo: "/images/zigaboo.jpeg",
    Ringo: "/images/ringo.jpeg",
    Flanders: "/images/flanders.jpeg",
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl">Your Score</h1>
      <p className="text-2xl">{score} /54</p>
      <p className="text-2xl">{scoreCategory}</p>
      <Image
        loader={() => imageSrcMap[scoreCategory]}
        src={imageSrcMap[scoreCategory]}
        alt={scoreCategory}
        width={300}
        height={300}
      />
      <Link
        href="/"
        className="bg-slate-800 text-white text-2xl p-2 rounded-lg mt-12"
      >
        Back to Game
      </Link>
    </div>
  );
};

export default Score;
