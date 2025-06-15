// == src/echomind/PromptWorkbench.tsx ==
// EchoMind Workbench v5 – "Neural Aurora" Enhanced Edition
// ---------------------------------------------------------------------------
// Meta UI/UX Enhancement Directive Applied.
// This is not merely a UI; it is an emotionally resonant, dopamine-triggering,
// and immersive experience designed to feel like the future of creative AI.
// The logic and functionality remain unchanged from v4.
// ---------------------------------------------------------------------------
import { useState, useEffect, useRef, useMemo } from "react";
import {
  analyzePrompt,
  enhancePrompt,
  type PromptAnalysis,
  type EnhancedPrompt,
} from "./PromptEngine";
import { useDryRun } from "../dryrun/DryRunProvider";

/* -------------------------------------------------------------------------- */
/* 🎨 Design System & Color Palette Strategy (Neural Aurora Theme)          */
/* -------------------------------------------------------------------------- */
// This style block defines the foundational design tokens for the entire UI.
// It uses CSS variables for easy theming, supporting the requested dark mode
// with soft neon glows and harmonized contrasts. Each color is chosen for its
// psychological impact, evoking creativity, clarity, and futuristic calm.
const GlobalStyles = () => (
  <style>{`
    :root {
      /* --- Base Palette --- */
      --color-bg-primary: hsl(220, 25%, 8%); /* Deep, calm space blue */
      --color-bg-secondary: hsl(220, 25%, 12%); /* Slightly lighter layer */
      --color-bg-tertiary: hsl(220, 25%, 16%); /* For interactive elements */
      --color-glass-border: hsla(219, 31%, 75%, 0.1); /* Subtle edge for glassmorphism */

      /* --- Text & Content --- */
      --color-text-primary: hsl(215, 20%, 90%); /* Soft, readable off-white */
      --color-text-secondary: hsl(215, 15%, 65%); /* For metadata and hints */
      --color-text-tertiary: hsl(215, 10%, 45%); /* For disabled/placeholder states */

      /* --- Accents & CTAs (The Dopamine Triggers) --- */
      --color-accent-primary: hsl(170, 90%, 60%); /* Vibrant, energetic teal */
      --color-accent-secondary: hsl(290, 85%, 70%); /* Creative, inspiring violet */

      /* --- Semantic States --- */
      --color-glow-success: hsl(130, 90%, 55%);
      --color-glow-warning: hsl(40, 95%, 65%);
      --color-glow-danger: hsl(350, 95%, 65%);

      /* --- Shadows & Glows (The Ethereal Touch) --- */
      --shadow-glow-accent: 0 0 20px -5px hsla(170, 90%, 60%, 0.4), 0 0 8px -6px hsla(170, 90%, 60%, 1);
      --shadow-glow-sm: 0 0 8px -2px hsla(0, 0%, 0%, 0.5);
      --shadow-soft: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    /* -------------------------------------------------------------------------- */
    /* ✨ Dopamine Loop Engineering & Micro-interactions                        */
    /* -------------------------------------------------------------------------- */
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-20px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .animate-fade-in-down {
      /* This animation guides focus and creates a smooth, frictionless entry. */
      animation: fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes aurora-bg {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
    .animate-aurora {
      /* A subtle, living background that suggests AI-level genius and creativity. */
      background: linear-gradient(-45deg,
        hsla(170, 90%, 60%, 0.05),
        hsla(220, 25%, 8%, 1),
        hsla(220, 25%, 8%, 1),
        hsla(290, 85%, 70%, 0.05)
      );
      background-size: 400% 400%;
      animation: aurora-bg 20s ease infinite;
    }

    @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
    .hover-shimmer {
        background-image: linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
        background-size: 200% 100%;
    }
    .hover-shimmer:hover {
        animation: shimmer 1.5s infinite linear;
    }

    /* --- Custom Scrollbar for a polished feel --- */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
      background-color: hsla(219, 15%, 50%, 0.4);
      border-radius: 4px;
      transition: background-color 0.3s ease;
    }
    ::-webkit-scrollbar-thumb:hover {
      background-color: hsla(219, 15%, 50%, 0.7);
    }
  `}</style>
);

/* -------------------------------------------------------------------------- */
/* 🔮 Icon Library (Enhanced for Visual Harmony)                              */
/* -------------------------------------------------------------------------- */
// No structural changes, but their usage will now be more intentional.
// They serve as visual anchors, reinforcing the action's intent.
const Icon = ({ name, className }: { name: string; className?: string }) => {
  const icons: { [key: string]: JSX.Element } = {
    close: <path d="M18 6 6 18M6 6l12 12" />,
    zap: <path d="m13 2-3 14h3l-3 14" />, // For 'Enhance' action
    brain: (
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.94.44c-.47-1.65-2.26-3.33-4.12-3.33-1.41 0-2.44 1.48-2.44 3.33A2.5 2.5 0 0 1 5.44 22H18.5a2.5 2.5 0 0 0 2.5-2.5v-15a2.5 2.5 0 0 0-2.5-2.5h-9Z" />
    ), // For 'GPT-Rewrite'
    rocket: (
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.05-.64-.75-2.19-.75-3.05-.05Z" />
    ), // For 'Launch'
    alert: (
      <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    ), // For warnings
    check: <path d="M20 6 9 17l-5-5" />, // For success states
    history: <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />, // For 'Vault' history
  };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {icons[name]}
    </svg>
  );
};

/* -------------------------------------------------------------------------- */
/* 🧩 Helper Components (Redesigned for the Meta-Layer Experience)           */
/* -------------------------------------------------------------------------- */
// Each component is now a piece of emotional storytelling via interface.

const ClarityGauge = ({ score }: { score: number }) => {
  const size = 100; // Larger for more impact
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Colors are now mapped to the new, vibrant glow palette
  const colorClass =
    score > 80
      ? "text-[var(--color-glow-success)]"
      : score > 50
        ? "text-[var(--color-glow-warning)]"
        : "text-[var(--color-glow-danger)]";

  return (
    // Component Module: Clarity Score Visualizer
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg className="absolute -rotate-90" width={size} height={size}>
        {/* The background track with a subtle glow */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-[var(--color-bg-tertiary)]"
          fill="transparent"
        />
        {/* The score ring, animated and glowing to provide clear, rewarding feedback. */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-[stroke-dashoffset] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${colorClass}`}
          style={{ filter: "url(#glow)" }}
        />
      </svg>
      {/* The score text, now larger and more central to the design */}
      <span
        className={`font-mono text-3xl font-bold tracking-tighter ${colorClass}`}
      >
        {score}
      </span>
    </div>
  );
};

const AnalysisPill = ({
  icon,
  text,
  type,
}: {
  icon: string;
  text: string;
  type: "success" | "warning" | "danger";
}) => {
  // Mapping types to the new glow color system
  const typeClasses = {
    success:
      "text-[var(--color-glow-success)] border-[var(--color-glow-success)]/20 bg-[var(--color-glow-success)]/10",
    warning:
      "text-[var(--color-glow-warning)] border-[var(--color-glow-warning)]/20 bg-[var(--color-glow-warning)]/10",
    danger:
      "text-[var(--color-glow-danger)] border-[var(--color-glow-danger)]/20 bg-[var(--color-glow-danger)]/10",
  };

  return (
    // Component Module: Analysis Feedback Pill
    // Glassmorphism applied: frosted, layered UI with soft glow edges.
    <div
      className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-300 hover:bg-white/10 ${typeClasses[type]}`}
    >
      <Icon name={icon} className="h-4 w-4" />
      <span>{text}</span>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 🧠 Main Component: The Prompt Workbench                                   */
/* -------------------------------------------------------------------------- */
interface VaultEntry {
  ts: number;
  raw: string;
  meta: EnhancedPrompt;
}

interface WorkbenchProps {
  onClose?: () => void;
}

export default function PromptWorkbench({ onClose }: WorkbenchProps) {
  /* ------ State & Hooks (Unchanged Logic) -------------------------------- */
  const { simulate, addToast } = useDryRun();
  const [raw, setRaw] = useState("");
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [enhanced, setEnhanced] = useState<EnhancedPrompt | null>(null);
  const [vault, setVault] = useState<VaultEntry[]>(() => {
    try {
      // strip any legacy items that lack a .meta object
      return (
        JSON.parse(localStorage.getItem("promptVault") || "[]") as VaultEntry[]
      ).filter((v) => v?.meta);
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(true);
  const [suggestion, setSuggestion] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ------ Global Shortcut (Unchanged Logic) ----------------------------- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "E") {
        e.preventDefault();
        setIsOpen((s) => !s);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ------ Live Analysis (Unchanged Logic) ------------------------------- */
  const runAnalysis = useMemo(
    () =>
      debounce((text: string) => {
        if (!text.trim()) {
          setAnalysis(null);
          setSuggestion("");
          return;
        }
        const a = analyzePrompt(text);
        setAnalysis(a);
        const vagueRegex = /\b(kind of|sort of|a bit|thing|stuff|something)\b/i;
        const match = text.match(vagueRegex);
        if (match && text.endsWith(match[0])) {
          setSuggestion(
            text.slice(0, -match[0].length) + `specify the ${match[0]}`,
          );
        } else {
          setSuggestion("");
        }
      }, 300), // Slightly longer debounce for a smoother feel
    [],
  );

  useEffect(() => {
    runAnalysis(raw);
  }, [raw, runAnalysis]);

  /* ------ Autocomplete (Unchanged Logic) --------------------------------- */
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab" && suggestion) {
      e.preventDefault();
      setRaw(suggestion);
      setSuggestion("");
    }
  };

  /* ------ Enhance Flow (Unchanged Logic) -------------------------------- */
  const handleEnhance = async () => {
    if (!analysis) return;
    const result = await simulate(
      "Enhance Prompt",
      async () => enhancePrompt(analysis),
      {
        stub: {
          success: { metaPrompt: "stub", reasoning: [] },
          failure: new Error("fail"),
        },
      },
    );
    setEnhanced(result);
    const entry = { ts: Date.now(), raw, meta: result } as VaultEntry;
    const nextVault = [entry, ...vault].slice(0, 50);
    setVault(nextVault);
    localStorage.setItem("promptVault", JSON.stringify(nextVault));
    addToast({
      type: "success",
      title: "Enhanced",
      message: "Prompt saved to vault.",
    });
    fetch("/api/vault", { method: "POST", body: JSON.stringify(entry) }).catch(
      () => {},
    );
  };

  /* ------ GPT Rewrite (Unchanged Logic) --------------------------------- */
  const rewriteWithGPT = async () => {
    if (!raw.trim()) return;
    addToast({
      type: "info",
      title: "GPT-Rewrite",
      message: "Contacting LLM...",
    });
    try {
      const res = await fetch("/api/rewriter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: raw }),
      });
      const { rewritten } = await res.json();
      setRaw(rewritten);
      addToast({
        type: "success",
        title: "GPT-Rewrite Complete",
        message: "Prompt updated.",
      });
    } catch {
      addToast({
        type: "error",
        title: "GPT-Rewrite Failed",
        message: "Endpoint unreachable.",
      });
    }
  };

  /* ------ Launch ChatGPT (Unchanged Logic) ------------------------------ */
  const launchChatGPT = () => {
    if (!enhanced?.metaPrompt) return;
    window.open(
      "https://chat.openai.com/?prompt=" +
        encodeURIComponent(enhanced.metaPrompt),
      "_blank",
    );
  };

  /* -------------------------------------------------------------------------- */
  /* 🌐 Modern Interface Layout & Meta-Layer Experience                      */
  /* -------------------------------------------------------------------------- */
  // The design itself feels like an answer: intelligent, structured, and futuristic.
  // We use a two-column layout for a clear "workbench" paradigm.
  // Left: Input & Analysis (Creation Zone). Right: Vault (Reference Zone).
  if (!isOpen) return null;

  return (
    <>
      <GlobalStyles />
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 font-sans text-[var(--color-text-primary)] backdrop-blur-lg">
        {/* 🆕 2. backdrop closes overlay AND notifies parent */}
        <div
          className="absolute inset-0"
          onClick={() => {
            setIsOpen(false);
            onClose?.();
          }}
        />
        <div
          className="animate-fade-in-down grid w-full max-w-6xl grid-cols-12 gap-8 rounded-2xl …"
          style={{ height: "min(800px, 90vh)" }}
        >
          {/* === COLUMN 1 – INTERACTIVE WORKBENCH === */}
          <div className="col-span-12 md:col-span-7 flex flex-col gap-6">
            {/* header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Prompt Workbench
              </h1>
              {/* 🆕 3. close button also calls parent onClose */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onClose?.();
                }}
                className="rounded-full p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-secondary)] hover:text-white"
              >
                <Icon name="close" className="h-6 w-6" />
              </button>
            </div>

            {/* --- Text Area: The Creative Core --- */}
            <div className="relative flex-grow flex flex-col">
              {/* Emotional Design: The textarea is designed to be the central focus.
                  The glowing border on focus invites interaction, and the subtle background
                  gradient makes it feel like a portal for ideas. */}
              <div className="relative h-full">
                <textarea
                  ref={textareaRef}
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Describe your goal here. Be as clear as possible..."
                  className="size-full resize-none rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-bg-secondary)]/50 p-4 pr-12 text-lg leading-relaxed text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] transition-all duration-300 focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/50"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1))", // Darkens the bg slightly for text contrast
                  }}
                />
                {/* Dopamine Loop: Autocomplete suggestion appears as frictionless ghost text.
                    Pressing 'Tab' feels like a satisfying, mind-reading completion. */}
                {suggestion && raw && (
                  <div className="pointer-events-none absolute inset-0 p-4 text-lg leading-relaxed">
                    <span className="invisible">{raw}</span>
                    <span className="text-[var(--color-text-tertiary)]/70">
                      {suggestion.substring(raw.length)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* --- Analysis Section: The AI's Insight --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center rounded-lg bg-[var(--color-bg-secondary)]/50 p-4 border border-[var(--color-glass-border)]">
              <div className="flex items-center justify-center">
                {analysis && <ClarityGauge score={analysis.clarityScore} />}
              </div>
              <div className="lg:col-span-2 flex flex-wrap gap-2 justify-center lg:justify-start">
                {analysis?.hasVagueTerms && (
                  <AnalysisPill icon="alert" text="Vague Terms" type="danger" />
                )}
                {analysis?.hasActionableVerbs && (
                  <AnalysisPill
                    icon="check"
                    text="Actionable Verbs"
                    type="success"
                  />
                )}
                {analysis?.isSpecific && (
                  <AnalysisPill icon="check" text="Specific" type="success" />
                )}
                {analysis?.isConcise > 80 && (
                  <AnalysisPill icon="check" text="Concise" type="success" />
                )}
                {analysis?.isConcise < 40 && (
                  <AnalysisPill icon="alert" text="Wordy" type="warning" />
                )}
              </div>
            </div>

            {/* --- Action Bar: The Dopamine Triggers --- */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Dopamine Loop: Primary CTA is vibrant, with a gradient and shimmer effect.
                  The 'pressed' state provides instant tactile feedback. */}
              <button
                onClick={handleEnhance}
                disabled={!analysis}
                className="flex-1 flex items-center justify-center gap-3 rounded-lg bg-[var(--color-accent-primary)] px-6 py-4 text-lg font-bold text-black shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.03] hover:shadow-[var(--shadow-glow-accent)] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none hover-shimmer"
              >
                <Icon name="zap" className="h-6 w-6" />
                <span>Enhance</span>
              </button>
              <button
                onClick={rewriteWithGPT}
                className="flex items-center justify-center gap-2 rounded-lg bg-[var(--color-bg-tertiary)] px-4 py-3 font-medium transition-all hover:bg-[var(--color-accent-secondary)]/80 hover:text-white active:scale-95 disabled:opacity-40"
              >
                <Icon name="brain" className="h-5 w-5" />
                <span>GPT-Rewrite</span>
              </button>
              {enhanced && (
                <button
                  onClick={launchChatGPT}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[var(--color-bg-tertiary)] px-4 py-3 font-medium text-[var(--color-accent-secondary)] transition-all hover:bg-[var(--color-accent-secondary)]/80 hover:text-white active:scale-95"
                >
                  <Icon name="rocket" className="h-5 w-5" />
                  <span>Launch</span>
                </button>
              )}
            </div>
          </div>

          {/* === COLUMN 2: THE VAULT (HISTORY) === */}
          <div className="col-span-12 md:col-span-5 flex flex-col gap-4 rounded-lg bg-[var(--color-bg-secondary)]/50 p-4 border border-[var(--color-glass-border)]">
            <div className="flex items-center gap-3">
              <Icon
                name="history"
                className="h-6 w-6 text-[var(--color-text-secondary)]"
              />
              <h2 className="text-xl font-bold">Prompt Vault</h2>
            </div>
            {/* Rewarding Exploration: The Vault provides a frictionless way to review past work.
                Each entry is clearly structured, and hover states reveal more information. */}
            <div className="overflow-y-auto pr-2 space-y-3">
              {vault.length > 0 ? (
                vault.map((entry) => (
                  <div
                    key={entry.ts}
                    className="group cursor-pointer rounded-lg p-3 transition-all duration-300 hover:bg-[var(--color-bg-tertiary)]"
                    onClick={() => {
                      setRaw(entry.raw);
                      setEnhanced(entry.meta);
                    }}
                  >
                    <p className="truncate text-[var(--color-text-primary)] group-hover:text-white">
                      {entry.raw}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)] mt-1">
                      <span>{new Date(entry.ts).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <Icon
                          name="check"
                          className="h-3 w-3 text-[var(--color-glow-success)]"
                        />
                        {entry.meta?.reasoning?.length ?? 0} Enhancements
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-[var(--color-text-secondary)]">
                  <Icon name="brain" className="h-12 w-12 opacity-20 mb-4" />
                  <p>
                    Your enhanced prompts will be saved here for future
                    reference.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Debounce Util (Unchanged Logic)                                            */
/* -------------------------------------------------------------------------- */
const debounce = (fn: (...args: any[]) => void, ms = 300) => {
  let t: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};
