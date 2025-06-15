import React, { useState } from "react";
import { Header } from "./components/Header";
import { Navigation, Page } from "./components/Navigation";
import { UserCreationForm } from "./components/UserCreationForm";
import PromptWorkbench from "./echomind/PromptWorkbench";
import { useDryRun } from "./dryrun/DryRunProvider";
import { DryRunDashboard } from "./dryrun/DryRunDashboard";
import { THEME } from "./components/theme";

const AppContent: React.FC = () => {
  const { mode, simulate, addToast } = useDryRun();
  const [page, setPage] = useState<Page>("home");
  const currentTheme = THEME.modes[mode];

  const handleTitleChange = async () => {
    try {
      await simulate(
        "Change Document Title",
        async () => {
          document.title = `[${mode.toUpperCase()}] Dry Run App`;
          return { success: true };
        },
        {
          stub: {
            success: { success: true },
            failure: new Error("Preview failed: Could not access document"),
          },
        },
      );
      addToast({
        type: "success",
        title: "Action Processed",
        message: "Title change operation was sent to the simulator.",
      });
    } catch (e: any) {
      addToast({ type: "error", title: "Action Failed", message: e.message });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-200 font-sans">
      <div
        className={`absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 ${currentTheme.toBg} transition-all duration-700 -z-10`}
      ></div>
      <div className="absolute inset-0 bg-grid opacity-5 -z-10"></div>

      <div className="relative isolate flex flex-col items-center justify-between p-6 md:p-8 min-h-screen">
        <Header />
        <main className="w-full max-w-6xl flex-grow flex flex-col justify-center items-center p-4 z-10">
          <Navigation page={page} setPage={setPage} mode={mode} />
          {page === "home" && (
            <div className="text-center animate-fade-in space-y-6">
              <h2 className="text-3xl font-bold text-white">
                Validate Real Behavior
              </h2>
              <p className="text-gray-400 max-w-lg">
                Click the button below to attempt a DOM side-effect (changing
                the page title). This action will only be executed in 'live' or
                'healing' modes.
              </p>
              <button
                onClick={handleTitleChange}
                className={`bg-gradient-to-r ${currentTheme.gradient} text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}
              >
                Attempt Title Change
              </button>
            </div>
          )}
          {page === "createUser" && <UserCreationForm mode={mode} />}
          {page === "workbench" && (
            <PromptWorkbench onClose={() => setPage("home")} />
          )}
        </main>
        <footer className="w-full text-center p-4 text-gray-600 z-10 text-sm font-mono">
          Dry Run Environment | God-Level Edition
        </footer>
      </div>
      <DryRunDashboard />
    </div>
  );
};

export default AppContent;
