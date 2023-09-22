"use client";

import React, { useEffect, useRef, useState } from "react";

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
  const rhythmPatternRef = useRef<any[]>([]);
  const goodTapSoundBuffer = useRef<AudioBuffer | null>(null);
  const compHitTimingsRef = useRef<number[]>([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  //const goodTap = useRef(false);
  const [goodTap, setGoodTap] = useState(false);
  const [, forceRender] = useState(0);

  // Function to read CSV and populate rhythmPattern
  const loadUserCSV = async () => {
    try {
      const response = await fetch("hit_timingsUser1.csv");
      const data = await response.text();
      const times = data.split("\n").map(Number);
      const newRhythmPattern = times.map((time) => ({ type: "hit", time }));
      rhythmPatternRef.current = newRhythmPattern;
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

    const handleKeyDown = (event: any) => {
      console.log("Key Down Event:", event);

      if (event.keyCode >= 32 && event.keyCode <= 90) {
        if (event.repeat) return;
      }

      setGoodTap((prev) => {
        console.log("Setting Good Tap to: true");
        return true;
      });
      forceRender((n) => n + 1);
      setTimeout(() => {
        setGoodTap((prev) => {
          console.log("Setting Good Tap to: false");
          return false;
        });
      }, 500);
    };

    window.addEventListener("keydown", handleKeyDown);

    const gameLoop = () => {
      /* console.log("gameLoop running"); */
      if (!analyser) return;

      let frequencyData = new Uint8Array(analyser.frequencyBinCount);

      // Update frequency data
      analyser.getByteFrequencyData(frequencyData);

      // Clear the canvas
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      // Since we already checked ctx and audio, we can safely access their properties.
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

      if (goodTap) {
        console.log("Rendering Good Tap");
        ctx.fillStyle = "green";
        ctx.fillRect(0, 0, canvas!.width, canvas!.height);

        console.log("Trying to play sound");
        if (
          goodTapSoundBuffer.current &&
          audioContext &&
          audioContext.state === "running"
        ) {
          console.log("Playing Good Tap Sound");
          const source = audioContext.createBufferSource();
          source.buffer = goodTapSoundBuffer.current;
          source.connect(audioContext.destination);
          source.start();
        } else {
          console.log("Audio Context not running");
        }
      }

      requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      console.log("Cleaning up keydown listener");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [analyser, audioContext]);

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
