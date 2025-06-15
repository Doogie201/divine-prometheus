import React from "react";
import { THEME } from "./theme";
import { HomeIcon, UserPlusIcon, BrainIcon } from "./Icons";

export type Page = "home" | "createUser" | "workbench";

interface Props {
  page: Page;
  setPage: (p: Page) => void;
  mode: keyof typeof THEME.modes;
}

export const Navigation: React.FC<Props> = ({ page, setPage, mode }) => {
  const currentTheme = THEME.modes[mode];
  return (
    <nav className="flex gap-2 mb-12 p-2 bg-black/20 rounded-xl border border-white/5 backdrop-blur-sm shadow-lg">
      <button
        onClick={() => setPage("home")}
        className={`px-5 py-2 rounded-lg flex items-center gap-3 font-semibold transition-colors ${
          page === "home"
            ? `bg-white/10 ${currentTheme.textColor}`
            : "text-gray-400 hover:bg-white/5"
        }`}
      >
        <HomeIcon className="w-5 h-5" />
        Home
      </button>
      <button
        onClick={() => setPage("createUser")}
        className={`px-5 py-2 rounded-lg flex items-center gap-3 font-semibold transition-colors ${
          page === "createUser"
            ? `bg-white/10 ${currentTheme.textColor}`
            : "text-gray-400 hover:bg-white/5"
        }`}
      >
        <UserPlusIcon className="w-5 h-5" />
        Test Form
      </button>
      <button
        onClick={() => setPage("workbench")}
        className="px-5 py-2 rounded-lg flex items-center gap-3 font-semibold transition-colors text-gray-400 hover:bg-white/5"
      >
        <BrainIcon className="w-5 h-5" />
        Workbench
      </button>
    </nav>
  );
};
