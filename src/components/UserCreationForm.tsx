import React, { useState, type FormEvent } from "react";
import { useDryRun } from "../dryrun/DryRunProvider";
import { THEME } from "./theme";

interface Props {
  mode: keyof typeof THEME.modes;
}

export const UserCreationForm: React.FC<Props> = ({ mode }) => {
  const { simulate, addToast } = useDryRun();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("Ada Lovelace");
  const currentTheme = THEME.modes[mode];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await simulate(
        `Create User: ${name}`,
        async () => {
          await new Promise((res) => setTimeout(res, 800));
          if (Math.random() > 0.7) throw new Error("API Limit Exceeded");
          localStorage.setItem("lastUser", name);
          return { success: true, userId: `usr_${Date.now()}` };
        },
        {
          retries: 2,
          stub: {
            success: { success: true, userId: "usr_stub_123" },
            failure: new Error("Invalid user name"),
          },
        },
      );
      addToast({
        type: "success",
        title: "Operation Succeeded",
        message: `User creation for ${name} completed via ${mode} mode.`,
      });
      setName("");
    } catch (error: any) {
      addToast({
        type: "error",
        title: "Operation Failed",
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-gray-900/30 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-2xl animate-fade-in">
      <h2 className="text-2xl font-bold text-center text-white mb-2">
        Register Identity
      </h2>
      <p className="text-gray-400 text-center mb-8">
        This form simulates user creation with retries.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Alias
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-800/50 border-2 border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:border-transparent outline-none transition"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-gradient-to-r ${currentTheme.gradient} text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-300 flex items-center justify-center`}
        >
          {isLoading ? "Transmitting..." : "Commit Identity"}
        </button>
      </form>
    </div>
  );
};
