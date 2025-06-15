import React from "react";
import { useDryRun } from "../dryrun/DryRunProvider";
import { THEME } from "./theme";

export const Header: React.FC = () => {
  const { mode } = useDryRun();
  const currentTheme = THEME.modes[mode];

  return (
    <header className="relative w-full max-w-6xl text-center z-10 p-8 flex flex-col items-center animate-fade-in-down">
      <div
        className={`absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br ${currentTheme.glow} to-transparent rounded-full blur-3xl opacity-40 animate-pulse-slow transition-all duration-700`}
      ></div>
      <div
        className={`absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl ${currentTheme.glow} to-transparent rounded-full blur-3xl opacity-40 animate-pulse-slow animation-delay-3000 transition-all duration-700`}
      ></div>

      <div className="relative z-10 p-4 rounded-xl">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient} opacity-10 blur-xl`}
        ></div>
        <div className="flex items-center gap-4">
          <currentTheme.Icon
            className={`w-12 h-12 lg:w-16 lg:h-16 ${currentTheme.textColor} transition-colors duration-500`}
          />
          <h1
            className={`text-5xl lg:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r ${currentTheme.gradient} leading-tight transition-all duration-500`}
          >
            {currentTheme.name}
          </h1>
        </div>
        <p
          className={`text-lg text-gray-300/80 mt-4 max-w-2xl mx-auto transition-all duration-500`}
        >
          {currentTheme.description}
        </p>
      </div>
    </header>
  );
};
