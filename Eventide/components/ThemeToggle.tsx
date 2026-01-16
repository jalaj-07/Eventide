import React, { useState } from 'react';
import { useTheme } from './ThemeContext';
import { Sun } from "lucide-react";



const MoonPhaseIcon = ({ phase }: { phase: number }) => {
  // 0: Crescent (Standard)
  // 1: Quarter (Half)
  // 2: Gibbous (Bulging)
  // 3: Full (Circle)
  
  const size = 24;
  
  if (phase === 0) {
    // Standard Crescent
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-indigo-400 fill-indigo-400/20"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    );
  }
  
  if (phase === 1) {
    // Quarter/Half Moon
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-indigo-400 fill-indigo-400/20"
      >
         <path d="M12 3a9 9 0 1 0 0 18V3Z" />
      </svg>
    );
  }

  if (phase === 2) {
    // Gibbous (Convex)
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-indigo-400 fill-indigo-400/20"
      >
        <path d="M12 3a9 9 0 1 1 0 18c2.5 0 5-2 5-9s-2.5-9-5-9Z" />
      </svg>
    );
  }

  // Phase 3: Full Moon
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-indigo-400 fill-indigo-400/20"
    >
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
};

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  // Initialize from localStorage or 0
  const [moonPhase, setMoonPhase] = useState(() => {
    const saved = localStorage.getItem('moonPhase');
    return saved ? parseInt(saved, 10) : 0;
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Only cycle phase if we are switching TO dark mode
    if (theme === 'light') {
      const nextPhase = (moonPhase + 1) % 4;
      setMoonPhase(nextPhase);
      localStorage.setItem('moonPhase', nextPhase.toString());
    }

    const doc = document as any;
    if (!doc.startViewTransition) {
      toggleTheme();
      return;
    }

    const x = e.clientX;
    const y = e.clientY;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const isDark = theme === 'light';

    const transition = doc.startViewTransition(() => {
        toggleTheme();
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      document.documentElement.animate(
        {
          clipPath: isDark ? clipPath : [...clipPath].reverse(),
        },
        {
          duration: 500,
          easing: "ease-in",
          pseudoElement: isDark
            ? "::view-transition-new(root)"
            : "::view-transition-old(root)",
        }
      );
    });
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
      aria-label="Toggle theme"
    >
        {theme === 'light' ? (
             <Sun size={24} className="text-amber-500 fill-amber-500/20" />
        ) : (
             <MoonPhaseIcon phase={moonPhase} />
        )}
    </button>
  );
};

export default ThemeToggle;
