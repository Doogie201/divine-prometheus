// == Divine Prometheus - Project Root ==
// Framework: React (w/ Vite recommended for speed)
// Styling: TailwindCSS + shadcn/ui + lucide icons
// Language: TypeScript
// Purpose: Turn Divine Meta Prompt Enhancer into a full UX-enhanced interactive web app

// === File System Structure (Recommended) ===
// - src/
//   ├── components/            ← Modular UI elements (e.g., Button, InputBox, Card)
//   ├── features/              ← Core app logic (promptEnhancer.ts, toneEngine.ts, etc.)
//   ├── pages/                 ← Main screen views (Home.tsx, Vault.tsx)
//   ├── utils/                 ← Reusable helpers (formatting.ts, logging.ts)
//   ├── hooks/                 ← Custom React hooks (useEnhancer.ts, useVault.ts)
//   ├── types/                 ← Centralized TypeScript types
//   └── App.tsx                ← Main app wrapper

// === Naming Conventions ===
// - Component files: PascalCase (e.g., PromptEnhancerCard.tsx)
// - Functions & hooks: camelCase (e.g., usePromptEnhancer)
// - Types: PascalCase with "Props" suffix if props (e.g., CardProps)
// - Enhancer rules: stored as modular, chainable functions

import React from "react";
import { PromptInput } from "./components/PromptInput";
import { EnhancedPreview } from "./components/EnhancedPreview";
import { ThoughtProcess } from "./components/ThoughtProcess";
import { VaultPanel } from "./components/VaultPanel";

function App() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <h1 className="text-4xl font-bold mb-4">Divine Prometheus 🔥</h1>
      <p className="text-zinc-400 mb-6 max-w-2xl">
        Enter a raw prompt and watch it be transformed into a maximized,
        ethical, emotionally intelligent, and AI-optimized divine prompt. No
        misuse shall pass.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PromptInput />
        <EnhancedPreview />
      </div>

      <div className="mt-8">
        <ThoughtProcess />
      </div>

      <div className="mt-8">
        <VaultPanel />
      </div>
    </main>
  );
}

export default App;
