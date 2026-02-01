"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";

const CODE_LIFESPAN = 30;

interface ProgressContextValue {
  remaining: number;
  progress: number;
}

const ProgressContext = createContext<ProgressContextValue>({
  remaining: CODE_LIFESPAN,
  progress: 100,
});

export function useGlobalProgress() {
  return useContext(ProgressContext);
}

export function GlobalProgressProvider({ children }: { children: ReactNode }) {
  const [remaining, setRemaining] = useState(CODE_LIFESPAN);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const updateProgress = () => {
      const seconds = new Date().getSeconds();
      const rem = CODE_LIFESPAN - (seconds % CODE_LIFESPAN);
      setRemaining(rem);
      setProgress((rem / CODE_LIFESPAN) * 100);
    };

    updateProgress();
    const timer = setInterval(updateProgress, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <ProgressContext.Provider value={{ remaining, progress }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function GlobalProgressBar() {
  const { progress } = useGlobalProgress();

  // Calculate color based on progress: green (100%) -> yellow (50%) -> red (0%)
  const getProgressColor = (p: number) => {
    // p: 0-100
    if (p > 50) {
      // Green to Yellow: 100% -> 50%
      const ratio = (p - 50) / 50;
      const r = Math.round(255 * (1 - ratio));
      const g = 200;
      return `rgb(${r}, ${g}, 0)`;
    } else {
      // Yellow to Dark Red: 50% -> 0%
      const ratio = p / 50;
      const r = Math.round(180 + 75 * ratio); // 180 (dark red) to 255 (yellow-red)
      const g = Math.round(200 * ratio);
      return `rgb(${r}, ${g}, 0)`;
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[5px] bg-secondary/30">
      <div
        className="h-full transition-all duration-1000 ease-linear shadow-sm"
        style={{
          width: `${progress}%`,
          backgroundColor: getProgressColor(progress),
        }}
      />
    </div>
  );
}
