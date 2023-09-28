"use client";
console.log("Running");
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
  const audioStartTimeRef = useRef<number | null>(null);
  const lastGoodTapTimestampRef = useRef<number | null>(null);
  const lastBadTapTimestampRef = useRef<number | null>(null);
  const goodTapCountRef = useRef<number>(0);
  const badTapCountRef = useRef<number>(0);
  const goodTapRef = useRef<number | null>(null);
  const lastPlayedTapRef = useRef<number | null>(null);
  const phraseIntervalRef = useRef<number | null>(null);
  const lastBackgroundColorChangeRef = useRef<number | null>(null);
  const currentBgColorRef = useRef<string>("gray");

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [isReadyToStart, setIsReadyToStart] = useState(false);

  const router = useRouter();

  // Function to read CSV and populate rhythmPattern
  const loadUserCSV = async () => {
    try {
      const response = await fetch("userhits.csv");
      const data = await response.text();
      const times = data.split("\n").map(Number).filter(Boolean); // Added filter to remove any NaN due to empty lines

      // Pop the last value from times and store it in phaseIntervalRef if it exists
      const lastTime = times.pop();
      if (typeof lastTime !== "undefined") {
        phraseIntervalRef.current = lastTime;
      }

      const newRhythmPattern = times.map((time) => ({ type: "hit", time }));
      userHitTimingsRef.current = newRhythmPattern;

      console.log("User hit timings:", userHitTimingsRef.current);
      console.log("Phrase interval:", phraseIntervalRef.current);
    } catch (error) {
      console.error("An error occurred while fetching the CSV file:", error);
    }
  };

  const loadCompCSV = async () => {
    try {
      const response = await fetch("comphits.csv");
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

      let timeElapsed = Date.now() - (audioStartTimeRef.current || 0);
      console.log(`Time elapsed since audio started: ${timeElapsed} ms`);
    }
  };

  const handleSongEnd = useCallback(() => {
    const goodTaps = goodTapCountRef.current;
    const badTaps = badTapCountRef.current;

    const finalScore = goodTaps - badTaps / 2;
    router.push(`/score?score=${finalScore}`);
  }, [router]);

  const gameLoop = useCallback(() => {
    /* console.log("Inside gameLoop. goodTap:", goodTapRef); */
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const audio = audioRef.current;

    if (!ctx || !audio || !analyser) return;

    const currentAudioTimeMs = audio.currentTime * 1000;

    if (lastBackgroundColorChangeRef.current === null) {
      lastBackgroundColorChangeRef.current = currentAudioTimeMs;
    }

    if (
      phraseIntervalRef.current &&
      currentAudioTimeMs - lastBackgroundColorChangeRef.current >=
        phraseIntervalRef.current
    ) {
      // Toggle the background color
      currentBgColorRef.current =
        currentBgColorRef.current === "black" ? "gray" : "black";

      // Update the time of the last background color change
      lastBackgroundColorChangeRef.current = currentAudioTimeMs;
    }

    // Update frequency data
    let frequencyData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencyData);

    // Clear the canvas
    ctx.clearRect(0, 0, canvas!.width, canvas!.height);
    ctx.fillStyle = currentBgColorRef.current;
    ctx.fillRect(0, 0, canvas!.width, canvas!.height);

    ctx.fillStyle = "white";
    for (let i = 0; i < frequencyData.length; i++) {
      const value = frequencyData[i];
      ctx.fillRect(i * 3, canvas!.height - value, 2, value);
    }

    const handleUserTap = () => {
      console.log("Trying to play user tap sound");
      if (goodTapSoundBuffer.current && audioContext) {
        console.log("Playing user tap sound");
        const source = audioContext.createBufferSource();
        source.buffer = goodTapSoundBuffer.current;
        source.connect(audioContext.destination);
        source.start();

        ctx.fillStyle = "green"; // Set the canvas color to green for good taps
        ctx.fillRect(0, 0, canvas!.width, canvas!.height);

        lastGoodTapTimestampRef.current = Date.now();

        goodTapCountRef.current += 1;

        lastPlayedTapRef.current = goodTapRef.current;
        goodTapRef.current = null;
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

        ctx.fillStyle = "red"; // Set the canvas color to red for bad taps
        ctx.fillRect(0, 0, canvas!.width, canvas!.height);

        lastBadTapTimestampRef.current = Date.now();

        badTapCountRef.current += 1;

        lastPlayedBadTapRef.current = goodTapRef.current;
        goodTapRef.current = null;
      }
    };

    ctx.font = "60px Inter";
    ctx.fillStyle = "green";
    ctx.fillText(`${goodTapCountRef.current}`, canvas!.width - 770, 60);

    ctx.fillStyle = "red";
    ctx.fillText(`${badTapCountRef.current}`, canvas!.width - 100, 60);

    const currentAudioTime = audio.currentTime * 1000;
    const buffer = 30;

    const isCompHitTime = compHitTimingsRef.current.some(
      (t) => Math.abs(currentAudioTime - t) <= buffer
    );

    if (isCompHitTime) {
      ctx.fillStyle = "blue";
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);
    }

    if (goodTapRef.current) {
      const timeSinceTap = Date.now() - goodTapRef.current;

      const wasGoodTap = userHitTimingsRef.current.some(
        (hitTime) => Math.abs(currentAudioTime - hitTime.time) <= 100
      );
      if (goodTapRef.current) {
        const timeSinceTap = Date.now() - goodTapRef.current;

        if (timeSinceTap < 100) {
          const wasGoodTap = userHitTimingsRef.current.some(
            (hitTime) => Math.abs(currentAudioTime - hitTime.time) <= 100
          );

          if (wasGoodTap && lastPlayedTapRef.current !== goodTapRef.current) {
            console.log("Playing good tap sound at:", goodTapRef.current);
            handleUserTap();
          } else if (lastPlayedBadTapRef.current !== goodTapRef.current) {
            console.log("Playing bad tap sound at:", goodTapRef.current);
            handleBadTap();
          }
        }
      }
    }
    const currentTimestamp = Date.now();

    // For good tap
    if (
      lastGoodTapTimestampRef.current &&
      currentTimestamp - lastGoodTapTimestampRef.current <= 50
    ) {
      ctx.fillStyle = "green";
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);
    }
    // For bad tap
    else if (
      lastBadTapTimestampRef.current &&
      currentTimestamp - lastBadTapTimestampRef.current <= 50
    ) {
      ctx.fillStyle = "red";
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);
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
    console.log("useEffect triggered.");
    const audio = audioRef.current;

    if (audio) {
      if (!audioContext) {
        console.log("AudioContext has not been initialized yet.");
      } else {
        console.log("AudioContext is already available.");

        // Loading sounds
        fetch("goodhit1.mp3")
          .then((response) => response.arrayBuffer())
          .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
          .then((audioBuffer) => {
            goodTapSoundBuffer.current = audioBuffer;
          });
        fetch("badhit1.mp3")
          .then((response) => response.arrayBuffer())
          .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
          .then((audioBuffer) => {
            badTapSoundBuffer.current = audioBuffer;
          });

        // Add ended event listener
        audio.addEventListener("ended", handleSongEnd);

        // Cleanup the event listener
        return () => {
          audio.removeEventListener("ended", handleSongEnd);
        };
      }
    } else {
      console.log("Audio not available yet.");
    }

    loadUserCSV();
    loadCompCSV();
  }, [audioContext, handleSongEnd]);

  /* const togglePlayPause = () => {
    const audio = audioRef.current;

    if (!audioContext) {
      console.log("Initializing AudioContext.");
      const newAudioContext = new window.AudioContext();
      setAudioContext(newAudioContext);

      const newAnalyser = newAudioContext.createAnalyser();
      setAnalyser(newAnalyser);
      console.log("Analyser:", analyser, "newAnalyser:", newAnalyser);
    }

    if (audio) {
      const source = audioContext!.createMediaElementSource(audio!);
      source.connect(analyser!);
      analyser!.connect(audioContext!.destination);
      if (isPlaying) {
        console.log("Pausing audio.");
        audio.pause();
      } else {
        console.log("Attempting to play audio.");
        if (audioContext && audioContext.state !== "running") {
          audioContext.resume().then(() => {
            setIsReadyToStart(true); // set the game as ready to start
          });
        }
        audio.play().catch((error) => {
          console.error("Playback error:", error.message);
        });
        audioStartTimeRef.current = Date.now() - audio.currentTime * 1000;
      }
      const newIsPlaying = !isPlaying;
      setIsPlaying(newIsPlaying);
      console.log("isPlaying:", !isPlaying);
    } else {
      console.log("Audio not initialized");
    }
  }; */

  const togglePlayPause = () => {
    const audio = audioRef.current;

    // Check if audioContext has been initialized, if not, initialize it.
    if (!audioContext) {
      console.log("Initializing AudioContext.");
      const newAudioContext = new window.AudioContext();
      setAudioContext(newAudioContext);

      const newAnalyser = newAudioContext.createAnalyser();
      setAnalyser(newAnalyser);

      // Here, make sure that audio exists and audioContext is available
      if (audio && newAudioContext) {
        const source = newAudioContext.createMediaElementSource(audio);
        source.connect(newAnalyser);
        newAnalyser.connect(newAudioContext.destination);
      }
    }

    if (audio) {
      if (isPlaying) {
        console.log("Pausing audio.");
        audio.pause();
      } else {
        console.log("Attempting to play audio.");
        if (audioContext && audioContext.state !== "running") {
          audioContext.resume().then(() => {
            setIsReadyToStart(true); // set the game as ready to start
          });
        }
        audio.play().catch((error) => {
          console.error("Playback error:", error.message);
        });
        audioStartTimeRef.current = Date.now() - audio.currentTime * 1000;
      }
      setIsPlaying(!isPlaying);
      console.log("isPlaying:", !isPlaying);
    } else {
      console.log("Audio not initialized");
    }
  };

  useEffect(() => {
    console.log(
      "useEffect for gameLoop triggered, isPlaying:",
      isPlaying,
      "audioContext:",
      audioContext,
      "analyser:",
      analyser
    );
    if (!analyser || !isPlaying || !audioContext) {
      console.log("Analyser or audio not initialized");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const audio = audioRef.current;

    if (!ctx || !audio) return;

    window.addEventListener("keydown", handleKeyDown);

    console.log("Starting gameLoop");
    gameLoop();

    return () => {
      /* console.log("Cleaning up keydown listener"); */
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [analyser, audioContext, gameLoop, isPlaying]);

  useEffect(() => {
    const preventSpacebarDefault = (event: KeyboardEvent) => {
      if (event.keyCode === 32) {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", preventSpacebarDefault);

    return () => {
      window.removeEventListener("keydown", preventSpacebarDefault);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="flex justify-center items-center"
      ></canvas>
      {isPlaying ? (
        <button
          onClick={togglePlayPause}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black p-4 rounded-lg"
        >
          Pause
        </button>
      ) : (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black p-4">
          <div>
            <h2 className="text-center font-bold text-lg">How to Play</h2>
            <p>
              - Listen carefully to the rhythm played while the screen is gray.
            </p>
            <p>
              - Hit any key to tap the same rhythm during the following bar(the
              next four beats) when the screen is black.
            </p>
            <p>- Green flash means your tap was good, red means it was bad.</p>
            <div className="flex justify-center">
              <button
                onClick={togglePlayPause}
                className="border-black border-solid border-2 p-2 mt-4 mb-2 rounded-lg bg-blue-300 w-64 font-bold text-lg"
              >
                Play
              </button>
            </div>
          </div>
        </div>
      )}
      {/* <button
        onClick={toggleFullScreen}
        className="absolute bottom-0  right-0 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black p-0"
      >
        Full Screen
      </button> */}
      <audio ref={audioRef} src="rhythmic3.mp3"></audio>
      {/* <audio ref={goodTapSoundRef} src="userhit3.wav"></audio> */}
    </div>
  );
};

export default GameCanvas;
