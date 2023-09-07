"use client";

import React, { useEffect, useRef, useState } from "react";

const rhythmPattern = [
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
];

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const compSoundRef = useRef<HTMLAudioElement | null>(null);
  const goodTapSoundRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const goodTap = useRef(false);

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
      const newAudioContext = new (window.AudioContext ||
        window.AudioContext)();
      setAudioContext(newAudioContext);
      const audioSource = newAudioContext.createMediaElementSource(audio);

      const newAnalyser = newAudioContext.createAnalyser();
      setAnalyser(newAnalyser); // set state
      audioSource.connect(newAnalyser);
      newAnalyser.connect(newAudioContext.destination);
    }
  }, []);

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
  /* const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (!audioContext) {
        const newAudioContext = new (window.AudioContext ||
          window.AudioContext)();
        setAudioContext(newAudioContext);
        const audioSource = newAudioContext.createMediaElementSource(audio);
        if (!analyser) {
          const newAnalyser = newAudioContext.createAnalyser();
          setAnalyser(newAnalyser); // set state
          audioSource.connect(newAnalyser);
          newAnalyser.connect(newAudioContext.destination);
        }
      }
      if (isPlaying) {
        audioContext?.suspend();
        audio.pause();
      } else {
        audioContext?.resume();
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  }; */

  useEffect(() => {
    console.log("useEffect called");
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const audio = audioRef.current;

    /* console.log("useEffect called");
    console.log("canvasRef.current:", canvasRef.current);
 */
    if (!ctx || !audio) return;

    const handleKeyDown = (event: any) => {
      console.log("Key Down Event:", event);

      if (event.keyCode >= 32 && event.keyCode <= 90) {
        if (event.repeat) return;

        goodTap.current = true;

        // Clear any existing timeouts
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
        }

        // Set the timeout to reset the goodTap
        timeoutRef.current = setTimeout(() => {
          goodTap.current = false;
        }, 50); // 50 ms
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const gameLoop = () => {
      /* console.log("gameLoop running"); */
      if (!analyser) return;

      requestAnimationFrame(gameLoop);

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

      //Flash blue and play comp tap sound according to programmed hits
      for (const cue of rhythmPattern) {
        if (Math.abs(cue.time - currentAudioTime) < 50) {
          ctx.fillStyle = "blue";
          ctx.fillRect(0, 0, canvas!.width, canvas!.height);
          compSoundRef.current?.play();
        }
      }

      //Flash green and play good tap sound when a good tap is detected
      if (goodTap.current) {
        ctx.fillStyle = "green";
        ctx.fillRect(0, 0, canvas!.width, canvas!.height);
        if (goodTapSoundRef.current) {
          console.log("About to play audio");
          goodTapSoundRef.current.currentTime = 0;
          goodTapSoundRef.current
            .play()
            .catch((e) => console.log("Play error: ", e));
          console.log("Audio should have played");
        }
        goodTap.current = false;
      }
    };

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [analyser]);

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
      <audio ref={audioRef} src="Rhythmic1_Demo1.wav"></audio>
      <audio ref={compSoundRef} src="207957__altemark__tom-1.wav"></audio>
      <audio
        ref={goodTapSoundRef}
        src="173838__yellowtree__tom-high.wav"
      ></audio>
    </div>
  );
};

export default GameCanvas;
