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

  if (score >= 51) {
    scoreCategory = "Animal";
  } else if (score >= 41 && score <= 50) {
    scoreCategory = "Zigaboo";
  } else if (score >= 31 && score <= 40) {
    scoreCategory = "Ringo";
  } else if (score <= 30) {
    scoreCategory = "Flanders";
  }
  console.log("Score", score, scoreCategory);

  const imageSrcMap: any = {
    Animal: "/images/animal.jpg",
    Zigaboo: "/images/zigaboo.jpeg",
    Ringo: "/images/ringo.jpeg",
    Flanders: "/images/flanders.jpeg",
  };

  const descriptionMap: any = {
    Animal: (
      <>
        You&apos;re rhythmic abilities are superhuman!
        <br />
        Color me impressed.
      </>
    ),
    Zigaboo: (
      <>
        You are a funky legend!
        <br />A true rizz-master extraordinaire.
      </>
    ),
    Ringo: (
      <>
        While not being &quot;significant&quot;, you still hold down
        <br />a great backbeat and that&apos;s why we love you.
      </>
    ),
    Flanders: (
      <>
        Oof. You have no rhythm, but you&apos;re still
        <br />a good person, probably. Who knows.
      </>
    ),
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl">Your GroovTap Score</h1>
      <p className="text-2xl">{score} /54</p>
      <p className="text-2xl pb-4">{scoreCategory}</p>
      <Image
        loader={() => imageSrcMap[scoreCategory]}
        src={imageSrcMap[scoreCategory]}
        alt={scoreCategory}
        width={300}
        height={300}
      />
      <p className="text-xl mt-4 text-center">
        {descriptionMap[scoreCategory]}
      </p>
      <p className="mt-4 text-lg">Test your sense of rhythm at groovtap.com</p>
      <Link
        href="/"
        className="bg-slate-800 text-white text-2xl p-2 rounded-lg mt-6"
      >
        Try Again
      </Link>
    </div>
  );
};

export default Score;
