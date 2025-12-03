"use client";

import { useEffect, useRef, useState } from "react";

const MIN_PHASE_DURATION = 1;
const MAX_PHASE_DURATION = 10;
const PHASE_STEP = 0.1;
const STORAGE_KEY = "breathe-phase-duration";

const formatPhase = (value: number) => value.toFixed(1);

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const isHoldPhaseForElapsed = (
  elapsedMs: number,
  phaseDurationSeconds: number
) => {
  if (phaseDurationSeconds <= 0) return false;
  const phaseMs = phaseDurationSeconds * 1000;
  const cycleMs = phaseMs * 4;
  if (cycleMs === 0) return false;
  const position = elapsedMs % cycleMs;
  const phaseIndex = Math.floor(position / phaseMs);
  return phaseIndex === 1 || phaseIndex === 3;
};

export default function Home() {
  const [phaseDuration, setPhaseDuration] = useState(4);
  const [isRunning, setIsRunning] = useState(false);
  const [displayMs, setDisplayMs] = useState(0);
  const [circleResetKey, setCircleResetKey] = useState(0);
  const [isHoldPhase, setIsHoldPhase] = useState(false);

  const elapsedRef = useRef(0);
  const startTimestampRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseDurationRef = useRef(phaseDuration);

  useEffect(() => {
    phaseDurationRef.current = phaseDuration;
  }, [phaseDuration]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) return;
    const parsed = parseFloat(storedValue);
    if (!Number.isFinite(parsed)) return;
    const clamped = Math.min(
      MAX_PHASE_DURATION,
      Math.max(MIN_PHASE_DURATION, parsed)
    );
    setPhaseDuration(parseFloat(clamped.toFixed(1)));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, phaseDuration.toFixed(1));
  }, [phaseDuration]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    if (isRunning) return;
    setIsRunning(true);
    startTimestampRef.current = performance.now();
    setDisplayMs(elapsedRef.current);
    setIsHoldPhase(
      isHoldPhaseForElapsed(elapsedRef.current, phaseDurationRef.current)
    );

    intervalRef.current = setInterval(() => {
      if (startTimestampRef.current === null) return;
      const now = performance.now();
      const elapsed = elapsedRef.current + (now - startTimestampRef.current);
      setDisplayMs(elapsed);
      setIsHoldPhase(isHoldPhaseForElapsed(elapsed, phaseDurationRef.current));
    }, 100);
  };

  const pauseTimer = () => {
    if (!isRunning) return;
    setIsRunning(false);

    if (startTimestampRef.current !== null) {
      const now = performance.now();
      elapsedRef.current += now - startTimestampRef.current;
      startTimestampRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setDisplayMs(elapsedRef.current);
    setIsHoldPhase(
      isHoldPhaseForElapsed(elapsedRef.current, phaseDurationRef.current)
    );
  };

  const handleStartPause = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsRunning(false);
    elapsedRef.current = 0;
    startTimestampRef.current = null;
    setDisplayMs(0);
    setCircleResetKey((key) => key + 1);
    setIsHoldPhase(false);
  };

  const handleDurationChange = (value: number) => {
    const nextValue = parseFloat(value.toFixed(1));
    setPhaseDuration(nextValue);

    if (!isRunning) {
      setIsHoldPhase(false);
      return;
    }

    const now = performance.now();
    const elapsed = startTimestampRef.current
      ? elapsedRef.current + (now - startTimestampRef.current)
      : elapsedRef.current;
    setIsHoldPhase(isHoldPhaseForElapsed(elapsed, nextValue));
  };

  return (
    <main className="flex min-h-screen w-full justify-center px-4 py-8 text-slate-100">
      <div className="flex w-full max-w-[640px] flex-col gap-6">
        <header className="rounded-2xl border border-slate-500/30 bg-slate-900/80 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-3">
              <h1 className="text-lg font-semibold tracking-tight">
                Box Breathing
              </h1>
              <p className="text-sm text-slate-400">
                Phase length:{" "}
                <span className="font-semibold text-slate-100">
                  {formatPhase(phaseDuration)}s
                </span>
              </p>
            </div>
            <DurationSlider
              value={phaseDuration}
              onChange={handleDurationChange}
            />
          </div>
        </header>

        <section className="flex flex-1 items-center justify-center py-4">
          <BreathingCircle
            key={circleResetKey}
            phaseDuration={phaseDuration}
            isRunning={isRunning}
            isHoldPhase={isHoldPhase}
          />
        </section>

        <footer className="rounded-2xl border border-slate-500/30 bg-slate-900/80 px-5 pb-3 pt-4 shadow-[0_18px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleStartPause}
                  className="rounded-full bg-linear-to-br from-sky-300 to-blue-600 px-5 py-2 text-sm font-semibold text-slate-900 shadow-[0_10px_25px_rgba(37,99,235,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(37,99,235,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                >
                  {isRunning ? "Pause" : "Start"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full border border-slate-500/60 px-3 py-1 text-xs font-medium text-slate-400 transition hover:border-slate-300 hover:text-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                >
                  Reset
                </button>
              </div>
              <p className="text-sm text-slate-400">
                Session time:{" "}
                <span
                  className="tabular-nums text-base font-medium text-slate-100"
                  aria-live="polite"
                >
                  {formatTime(displayMs)}
                </span>
              </p>
            </div>
            <p className="text-right text-xs text-slate-400">
              Inhale → hold → exhale → hold, each for the selected time.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}

type DurationSliderProps = {
  value: number;
  onChange: (value: number) => void;
};

function DurationSlider({ value, onChange }: DurationSliderProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <input
        className="breath-slider"
        type="range"
        min={MIN_PHASE_DURATION}
        max={MAX_PHASE_DURATION}
        step={PHASE_STEP}
        value={value}
        onChange={(event) => onChange(parseFloat(event.target.value))}
        aria-label="Phase duration in seconds"
      />
      <div className="flex justify-between text-xs text-slate-400">
        <span>1.0s (fast)</span>
        <span>10.0s (slow)</span>
      </div>
    </div>
  );
}

type BreathingCircleProps = {
  phaseDuration: number;
  isRunning: boolean;
  isHoldPhase: boolean;
};

function BreathingCircle({
  phaseDuration,
  isRunning,
  isHoldPhase,
}: BreathingCircleProps) {
  return (
    <div className="relative flex h-[min(70vw,260px)] w-[min(70vw,260px)] items-center justify-center">
      <div className="absolute inset-0 rounded-full border border-dashed border-slate-500/40 [box-shadow:inset_0_0_40px_rgba(15,23,42,0.9)]" />
      <div
        className={`breath-glow ${
          isRunning ? "" : "breath-glow--paused"
        } relative h-full w-full rounded-full border-4 border-sky-300 animate-breath`}
        style={{
          background:
            "radial-gradient(circle at 30% 20%, #e0f2fe 0%, #0f172a 70%)",
          animationDuration: `${phaseDuration * 4}s`,
          animationPlayState: isRunning ? "running" : "paused",
        }}
      />
      {isHoldPhase && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold uppercase tracking-[0.4em] text-white/70">
            HOLD
          </span>
        </div>
      )}
    </div>
  );
}
