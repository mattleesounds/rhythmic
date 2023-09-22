"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

/* const rhythmPattern = [
  { type: "hit", time: 2000 },
  { type: "hit", time: 4000 },
  { type: "hit", time: 6000 },
  { type: "hit", time: 8000 },
  { type: "hit", time: 10000 },
  { type: "hit", time: 12000 },
  { type: "hit", time: 14000 },
  { type: "hit", time: 16000 },
  { type: "hit", time: 18000 },
  { type: "hit", time: 20000 },
  { type: "hit", time: 22000 },
  { type: "hit", time: 24000 },
]; */

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const compSoundRef = useRef<HTMLAudioElement | null>(null);
  const goodTapSoundRef = useRef<HTMLAudioElement | null>(null);
  const userHitTimingsRef = useRef<any[]>([]);
  const goodTapSoundBuffer = useRef<AudioBuffer | null>(null);
  const compHitTimingsRef = useRef<number[]>([]);
  const badTapSoundBuffer = useRef<AudioBuffer | null>(null);
  const lastPlayedBadTapRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const goodTapRef = useRef<number | null>(null);
  const lastPlayedTapRef = useRef<number | null>(null);
  //const [goodTap, setGoodTap] = useState(false);
  const [, forceRender] = useState(0);

  // Function to read CSV and populate rhythmPattern
  const loadUserCSV = async () => {
    try {
      const response = await fetch("hit_timingsUser1.csv");
      const data = await response.text();
      const times = data.split("\n").map(Number);
      const newRhythmPattern = times.map((time) => ({ type: "hit", time }));
      userHitTimingsRef.current = newRhythmPattern;
      console.log("User hit timings:", userHitTimingsRef.current);
    } catch (error) {
      console.error("An error occurred while fetching the CSV file:", error);
    }
  };

  const loadCompCSV = async () => {
    try {
      const response = await fetch("hit_timings.csv");
      const data = await response.text();
      const times = data.split("\n").map(Number);
      const newRhythmPattern = times.map((time) => ({ type: "hit", time }));
      compHitTimingsRef.current = times;
      /* console.log("Loaded Comp Timings:", times); */
    } catch (error) {
      console.error("An error occurred while fetching the CSV file:", error);
    }
  };

  const toggleFullScreen = () => {
    const container = containerRef.current;
    if (container) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        container.requestFullscreen();
      }
    }
  };

  const handleKeyDown = (event: any) => {
    if (event.keyCode >= 32 && event.keyCode <= 90 && !event.repeat) {
      goodTapRef.current = Date.now();
      console.log(`Key pressed at: ${goodTapRef.current}`);
      let audioStartTime = audioRef.current!.currentTime * 1000;
      let timeElapsed = Date.now() - audioStartTime;
      console.log(`Time elapsed since audio started: ${timeElapsed} ms`);
    }
  };

  const gameLoop = useCallback(() => {
    /* console.log("Inside gameLoop. goodTap:", goodTapRef); */
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const audio = audioRef.current;

    if (!ctx || !audio || !analyser) return;

    const handleUserTap = () => {
      console.log("Trying to play user tap sound");
      if (goodTapSoundBuffer.current && audioContext) {
        console.log("Playing user tap sound");
        const source = audioContext.createBufferSource();
        source.buffer = goodTapSoundBuffer.current;
        source.connect(audioContext.destination);
        source.start();
      }
    };

    const handleBadTap = () => {
      console.log("Trying to play bad tap sound");
      if (badTapSoundBuffer.current && audioContext) {
        console.log("Playing bad tap sound");
        const source = audioContext.createBufferSource();
        source.buffer = badTapSoundBuffer.current;
        source.connect(audioContext.destination);
        source.start();
      }
    };

    // Update frequency data
    let frequencyData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencyData);

    // Clear the canvas
    ctx.clearRect(0, 0, canvas!.width, canvas!.height);
    ctx.fillStyle = "grey";
    ctx.fillRect(0, 0, canvas!.width, canvas!.height);

    ctx.fillStyle = "white";
    for (let i = 0; i < frequencyData.length; i++) {
      const value = frequencyData[i];
      ctx.fillRect(i * 3, canvas!.height - value, 2, value);
    }

    const currentAudioTime = audio.currentTime * 1000;
    const buffer = 50;

    const isCompHitTime = compHitTimingsRef.current.some(
      (t) => Math.abs(currentAudioTime - t) <= buffer
    );

    if (isCompHitTime) {
      ctx.fillStyle = "blue";
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);
    }

    if (goodTapRef.current) {
      const timeSinceTap = Date.now() - goodTapRef.current;

      const isGoodHit = userHitTimingsRef.current.some(
        (t) => Math.abs(timeSinceTap - t.time) <= 50
      );

      console.log("Checking hit type...", goodTapRef.current, isGoodHit);

      if (goodTapRef.current) {
        const timeSinceTap = Date.now() - goodTapRef.current;

        // Assuming you have a window of 100ms to register a "good" tap
        const wasGoodTap = userHitTimingsRef.current.some(
          (hitTime) => Math.abs(goodTapRef.current! - hitTime.time) <= 20
        );

        if (
          wasGoodTap &&
          timeSinceTap < 50 &&
          lastPlayedTapRef.current !== goodTapRef.current
        ) {
          handleUserTap();
          lastPlayedTapRef.current = goodTapRef.current;
        } else if (
          !wasGoodTap &&
          timeSinceTap < 50 &&
          lastPlayedBadTapRef.current !== goodTapRef.current
        ) {
          handleBadTap();
          lastPlayedBadTapRef.current = goodTapRef.current;
        }
      }
    }

    requestAnimationFrame(gameLoop);
  }, [
    canvasRef,
    audioRef,
    analyser,
    goodTapRef,
    lastPlayedTapRef,
    audioContext,
  ]);

  useEffect(() => {
    const audio = audioRef.current;

    if (audio && !audioContext) {
      const newAudioContext = new window.AudioContext();
      setAudioContext(newAudioContext);

      const audioSource = newAudioContext.createMediaElementSource(audio);
      const newAnalyser = newAudioContext.createAnalyser();
      setAnalyser(newAnalyser);

      audioSource.connect(newAnalyser);
      newAnalyser.connect(newAudioContext.destination);
    }

    if (audioContext) {
      fetch("userhit3.wav")
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
        .then((audioBuffer) => {
          goodTapSoundBuffer.current = audioBuffer;
        });
      fetch("badhit2.wav")
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
        .then((audioBuffer) => {
          badTapSoundBuffer.current = audioBuffer;
        });
    }

    loadUserCSV();
    loadCompCSV();
  }, [audioContext]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio && audioContext) {
      if (isPlaying) {
        audioContext.suspend();
        audio.pause();
      } else {
        audioContext.resume();
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const audio = audioRef.current;

    if (!ctx || !audio) return;

    window.addEventListener("keydown", handleKeyDown);

    gameLoop();

    return () => {
      console.log("Cleaning up keydown listener");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [analyser, audioContext, gameLoop]);

  return (
    <div className="relative" ref={containerRef}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="flex justify-center"
      ></canvas>
      <button
        onClick={togglePlayPause}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black p-4"
        //className="flex justify-end "
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
      <button
        onClick={toggleFullScreen}
        className="absolute bottom-0  right-0 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black p-0"
      >
        Full Screen
      </button>
      <audio ref={audioRef} src="Rhythmic2.wav"></audio>
      {/* <audio ref={goodTapSoundRef} src="userhit3.wav"></audio> */}
    </div>
  );
};

export default GameCanvas;
