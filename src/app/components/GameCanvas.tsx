"use client";

import React, { useEffect, useRef, useState } from "react";

const rhythmPattern = [
  { type: "hit", time: 2000 },
  { type: "hit", time: 4000 },
  { type: "hit", time: 6000 },
];

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const togglePlayPause = () => {
    if (!audioContext) {
      const newAudioContext = new (window.AudioContext ||
        window.AudioContext)();
      setAudioContext(newAudioContext);
    }
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audioContext?.suspend();
        audio.pause();
      } else {
        audioContext?.resume();
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const audio = audioRef.current;

    if (!ctx || !audio) return;

    //audio.play();
    const audioContext = new (window.AudioContext || window.AudioContext)();
    const audioSource = audioContext.createMediaElementSource(audio);
    const analyser = audioContext.createAnalyser();
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);

    let frequencyData = new Uint8Array(analyser.frequencyBinCount);

    const gameLoop = () => {
      requestAnimationFrame(gameLoop);

      // Since we already checked ctx and audio, we can safely access their properties.
      ctx.fillStyle = "grey";
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);

      ctx.fillStyle = "white";
      for (let i = 0; i < frequencyData.length; i++) {
        const value = frequencyData[i];
        ctx.fillRect(i * 3, canvas!.height - value, 2, value);
      }

      const currentAudioTime = audio.currentTime * 1000;
      for (const cue of rhythmPattern) {
        if (Math.abs(cue.time - currentAudioTime) < 50) {
          ctx.fillStyle = "red";
          ctx.fillRect(0, 0, canvas!.width, canvas!.height);
        }
      }
    };

    gameLoop();
  }, []);

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={800} height={600}></canvas>
      <button
        onClick={togglePlayPause}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black p-4"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
      <audio ref={audioRef} src="polpishTest1.wav"></audio>
    </div>
  );
};

export default GameCanvas;
