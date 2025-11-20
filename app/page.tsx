"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const TEXT_SEGMENTS = [
  {
    id: "segment-1",
    text: "Beetles are insects with hard bodies called elytra.",
    start: 0,
    end: 5
  },
  {
    id: "segment-2",
    text: "Elytra function to protect the wings underneath.",
    start: 5,
    end: 10
  },
  {
    id: "segment-3",
    text: "There are over 350,000 species of beetles in the world!",
    start: 10,
    end: 15
  }
];

const LOOP_DURATION = 15;
const FADE_DURATION = 1;

function useLoopTimer(duration: number) {
  const [time, setTime] = useState(0);
  const frameRef = useRef<number>();
  const startRef = useRef<number>();

  useEffect(() => {
    const update = (now: number) => {
      if (!startRef.current) {
        startRef.current = now;
      }
      const elapsed = (now - startRef.current) / 1000;
      setTime(elapsed % duration);
      frameRef.current = requestAnimationFrame(update);
    };
    frameRef.current = requestAnimationFrame(update);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [duration]);

  return time;
}

function useForestAmbience() {
  useEffect(() => {
    const AudioContextClass =
      typeof window !== "undefined" &&
      (window.AudioContext || (window as any).webkitAudioContext);

    if (!AudioContextClass) {
      return;
    }

    const audioContext = new AudioContextClass();
    const masterGain = audioContext.createGain();
    masterGain.gain.value = 0.05;
    masterGain.connect(audioContext.destination);

    let noiseNode: ScriptProcessorNode | null = null;
    let stopped = false;
    const activeTimeouts = new Set<number>();

    const createBrownNoise = () => {
      const bufferSize = 4096;
      const node = audioContext.createScriptProcessor(bufferSize, 1, 1);
      let lastOut = 0.0;

      node.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i += 1) {
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + 0.02 * white) / 1.02;
          output[i] = lastOut * 3.5;
        }
      };

      node.connect(masterGain);
      noiseNode = node;
    };

    const scheduleBirdChirp = () => {
      if (stopped) {
        return;
      }
      const timeout = window.setTimeout(() => {
        if (stopped) {
          return;
        }
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = "sine";
        const baseTime = audioContext.currentTime;
        osc.frequency.setValueAtTime(1000 + Math.random() * 400, baseTime);
        osc.frequency.exponentialRampToValueAtTime(
          500 + Math.random() * 200,
          baseTime + 0.35
        );

        gain.gain.setValueAtTime(0, baseTime);
        gain.gain.linearRampToValueAtTime(0.03, baseTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, baseTime + 0.4);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(baseTime);
        osc.stop(baseTime + 0.4);

        scheduleBirdChirp();
      }, 2000 + Math.random() * 3000);

      activeTimeouts.add(timeout);
    };

    const startAudio = () => {
      if (audioContext.state === "suspended") {
        void audioContext.resume();
      }
      if (!noiseNode) {
        createBrownNoise();
        scheduleBirdChirp();
      }
    };

    const handleInteraction = () => {
      startAudio();
    };

    document.addEventListener("pointerdown", handleInteraction, {
      once: true
    });

    startAudio();

    return () => {
      stopped = true;
      document.removeEventListener("pointerdown", handleInteraction);
      activeTimeouts.forEach((id) => window.clearTimeout(id));
      activeTimeouts.clear();
      if (noiseNode) {
        noiseNode.disconnect();
        noiseNode = null;
      }
      masterGain.disconnect();
      if (audioContext.state !== "closed") {
        void audioContext.close();
      }
    };
  }, []);
}

function Beetle() {
  return (
    <svg
      className="beetle"
      viewBox="0 0 180 120"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby="beetleTitle beetleDesc"
    >
      <title id="beetleTitle">Animated beetle</title>
      <desc id="beetleDesc">
        Simple illustration of a beetle with antennae, elytra, and wings.
      </desc>
      <defs>
        <linearGradient id="elytraGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3c5f0b" />
          <stop offset="100%" stopColor="#1f2d04" />
        </linearGradient>
        <linearGradient id="wingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f1f8c2" />
          <stop offset="100%" stopColor="#d3e37a" />
        </linearGradient>
      </defs>
      <g transform="translate(10 10)">
        <path
          d="M40 20 C30 5 20 5 10 20"
          stroke="#1b1b1b"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M120 20 C130 5 140 5 150 20"
          stroke="#1b1b1b"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse
          cx="80"
          cy="40"
          rx="35"
          ry="30"
          fill="#1a1a1a"
          stroke="#0f0f0f"
          strokeWidth="6"
        />
        <g className="wings">
          <path
            d="M80 50 C30 30 10 70 20 95 C45 105 70 95 80 70"
            fill="url(#wingGradient)"
            opacity="0.7"
          />
          <path
            d="M80 50 C130 30 150 70 140 95 C115 105 90 95 80 70"
            fill="url(#wingGradient)"
            opacity="0.7"
          />
        </g>
        <path
          d="M80 40 C35 40 35 100 80 100 C125 100 125 40 80 40"
          fill="url(#elytraGradient)"
          stroke="#142003"
          strokeWidth="6"
        />
        <line
          x1="80"
          y1="40"
          x2="80"
          y2="100"
          stroke="#091201"
          strokeWidth="4"
        />
        <g className="legs" stroke="#1b1b1b" strokeWidth="7" strokeLinecap="round">
          <path d="M30 80 L10 95" />
          <path d="M35 90 L15 105" />
          <path d="M40 100 L20 115" />
          <path d="M130 80 L150 95" />
          <path d="M125 90 L145 105" />
          <path d="M120 100 L140 115" />
        </g>
      </g>
    </svg>
  );
}

export default function Home() {
  const time = useLoopTimer(LOOP_DURATION);
  useForestAmbience();

  const segments = useMemo(() => {
    return TEXT_SEGMENTS.map((segment) => {
      const relativeTime = time >= segment.start && time < segment.end;
      const fadeInStart = segment.start;
      const fadeOutStart = segment.end - FADE_DURATION;
      let opacity = 0;

      if (time >= fadeInStart && time < fadeInStart + FADE_DURATION) {
        const progress = (time - fadeInStart) / FADE_DURATION;
        opacity = Math.min(1, Math.max(0, progress));
      } else if (time >= fadeOutStart && time < segment.end) {
        const progress = (segment.end - time) / FADE_DURATION;
        opacity = Math.min(1, Math.max(0, progress));
      } else if (relativeTime) {
        opacity = 1;
      } else {
        opacity = 0;
      }

      // Allow fade on wrap-around for first segment
      if (segment.start === 0 && time > LOOP_DURATION - FADE_DURATION) {
        const progress = (time - (LOOP_DURATION - FADE_DURATION)) / FADE_DURATION;
        opacity = Math.min(opacity, Math.max(0, 1 - progress));
      }

      return {
        ...segment,
        opacity
      };
    });
  }, [time]);

  return (
    <main className="scene" aria-label="Educational beetle animation">
      <div className="background">
        <div className="sun" />
        <div className="hill hill-1" />
        <div className="hill hill-2" />
        <div className="foliage foliage-left" />
        <div className="foliage foliage-right" />
      </div>
      <div className="beetle-track">
        <div className="beetle-shadow" />
        <div className="beetle-wrapper">
          <Beetle />
        </div>
      </div>
      <div className="text-layer">
        {segments.map((segment) => (
          <p
            key={segment.id}
            className="info-text"
            style={{ opacity: segment.opacity }}
          >
            {segment.text}
          </p>
        ))}
      </div>
    </main>
  );
}
