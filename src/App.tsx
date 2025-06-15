import React, {
  useState,
  type FC,
  type FormEvent,
  useEffect,
  useRef,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import PromptWorkbench from "./echomind/PromptWorkbench";
// =================================================================================
// 1. CONSOLIDATED LOGIC TO FIX BUILD ERRORS
// All necessary types, providers, and components are now in this single file
// to resolve the relative path import errors in the build environment.
// =================================================================================

// --- Canonical Types (from types.ts) ---
type DryRunMode = "live" | "dry" | "healing" | "preview";
const DRY_RUN_MODES: DryRunMode[] = ["live", "dry", "healing", "preview"];
interface StubData<T> {
  success: T;
  failure: Error;
}
interface SimulateOptions<T> {
  retries?: number;
  stub?: StubData<T>;
}
interface SimulatedEvent {
  id: number;
  label: string;
  mode: DryRunMode;
  timestamp: string;
  status: "success" | "failure" | "retrying" | "simulated" | "previewed";
  operation: string;
  attempts: number;
  result?: any;
  error?: string;
  stub?: StubData<any>;
}
type ToastMessage = {
  id: number;
  type: "success" | "error" | "info";
  message: string;
  title: string;
};
interface PromptAnalysis {
  original: string;
  cleaned: string;
  detectedLanguage: string;
  intent: string;
  missingPieces: string[];
  clarityScore: number;
  recommendations: string[];
}
interface EnhancedPrompt {
  metaPrompt: string;
  reasoning: string[];
}
interface DryRunContextType {
  mode: DryRunMode;
  setMode: (mode: DryRunMode) => void;
  simulate: <T>(
    label: string,
    operation: () => Promise<T>,
    options?: SimulateOptions<T>,
  ) => Promise<T>;
  events: SimulatedEvent[];
  clearEvents: () => void;
  previewOutcome: "success" | "failure";
  setPreviewOutcome: (outcome: "success" | "failure") => void;
  addToast: (toast: Omit<ToastMessage, "id">) => void;
}

// --- Canonical Context & Provider ---
const DryRunContext = createContext<DryRunContextType | undefined>(undefined);

const useDryRun = () => {
  const context = useContext(DryRunContext);
  if (!context) {
    throw new Error("useDryRun must be used within a DryRunProvider");
  }
  return context;
};

const CheckCircleIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);
const ExclamationCircleIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
    />
  </svg>
);
const InfoCircleIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
    />
  </svg>
);

const Toast: FC<{ toast: ToastMessage; onDismiss: (id: number) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);
  const ICONS = {
    success: CheckCircleIcon,
    error: ExclamationCircleIcon,
    info: InfoCircleIcon,
  };
  const COLORS = {
    success: { text: "text-green-400", border: "border-green-500/30" },
    error: { text: "text-red-400", border: "border-red-500/30" },
    info: { text: "text-blue-400", border: "border-blue-500/30" },
  };
  const Icon = ICONS[toast.type];
  const color = COLORS[toast.type];
  return (
    <div
      className={`flex items-start w-full max-w-sm p-4 rounded-xl shadow-2xl border backdrop-blur-xl bg-gray-900/80 ${color.border} animate-toast-in`}
    >
      <Icon className={`w-7 h-7 mr-4 ${color.text} flex-shrink-0`} />
      <div className="flex-grow">
        <h3 className="font-bold text-white">{toast.title}</h3>
        <p className="text-sm text-gray-300">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 -m-1 text-gray-500 hover:text-white"
      >
        &times;
      </button>
    </div>
  );
};

const ToastContainer: FC<{
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}> = ({ toasts, onDismiss }) => (
  <div className="fixed top-5 right-5 z-[150] space-y-3 font-sans">
    {toasts.map((t) => (
      <Toast key={t.id} toast={t} onDismiss={onDismiss} />
    ))}
  </div>
);

const DryRunProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<DryRunMode>("dry");
  const [events, setEvents] = useState<SimulatedEvent[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [previewOutcome, setPreviewOutcome] = useState<"success" | "failure">(
    "success",
  );
  const eventIdCounter = useRef(0);

  const addToast = (toast: Omit<ToastMessage, "id">) => {
    setToasts((prev) => [...prev.slice(-4), { ...toast, id: Date.now() }]);
  };
  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  const setMode = (newMode: DryRunMode) => {
    setModeState(newMode);
    addToast({
      type: "info",
      title: "Mode Switched",
      message: `Environment is now in ${newMode.toUpperCase()} mode.`,
    });
  };
  const addEvent = (eventData: Omit<SimulatedEvent, "id" | "timestamp">) => {
    const newEvent: SimulatedEvent = {
      ...eventData,
      id: eventIdCounter.current++,
      timestamp: new Date().toISOString(),
    };
    setEvents((prev) => [newEvent, ...prev.slice(0, 99)]);
  };
  const clearEvents = () => setEvents([]);

  const simulate = async <T,>(
    label: string,
    operation: () => Promise<T>,
    options: SimulateOptions<T> = {},
  ): Promise<T> => {
    const { retries = 0, stub } = options;
    const operationString =
      operation.toString().substring(0, 200) +
      (operation.toString().length > 200 ? "..." : "");
    const baseEventData = { label, mode, operation: operationString, stub };

    if (mode === "preview") {
      if (!stub) {
        const error = new Error(
          "Preview mode requires a 'stub' to be provided.",
        );
        addEvent({
          ...baseEventData,
          status: "failure",
          attempts: 1,
          error: error.message,
        });
        addToast({
          type: "error",
          title: "Preview Error",
          message: error.message,
        });
        throw error;
      }
      if (previewOutcome === "success") {
        addEvent({
          ...baseEventData,
          status: "previewed",
          attempts: 1,
          result: stub.success,
        });
        return Promise.resolve(stub.success);
      } else {
        addEvent({
          ...baseEventData,
          status: "previewed",
          attempts: 1,
          error: stub.failure.message,
        });
        return Promise.reject(stub.failure);
      }
    }
    if (mode === "dry") {
      addEvent({
        ...baseEventData,
        status: "simulated",
        attempts: 1,
        result: "Operation was not executed.",
      });
      return Promise.resolve(undefined as unknown as T);
    }

    for (let i = 0; i <= retries; i++) {
      try {
        const result = await operation();
        addEvent({
          ...baseEventData,
          status: "success",
          attempts: i + 1,
          result,
        });
        return result;
      } catch (error: any) {
        const isLastAttempt = i === retries;
        const errorMessage = error.message || "An unknown error occurred.";
        if (!isLastAttempt) {
          addEvent({
            ...baseEventData,
            status: "retrying",
            attempts: i + 1,
            error: errorMessage,
          });
        } else {
          if (mode === "healing") {
            console.warn(
              `[HEALING-MODE] Final attempt for "${label}" failed and was suppressed. Error:`,
              error,
            );
            addEvent({
              ...baseEventData,
              status: "failure",
              attempts: i + 1,
              error: `HEALED: ${errorMessage}`,
            });
            return Promise.resolve(undefined as unknown as T);
          } else {
            addEvent({
              ...baseEventData,
              status: "failure",
              attempts: i + 1,
              error: errorMessage,
            });
            throw error;
          }
        }
        await new Promise((res) => setTimeout(res, Math.pow(2, i) * 150));
      }
    }
    throw new Error("Simulation loop finished unexpectedly.");
  };

  const contextValue: DryRunContextType = {
    mode,
    setMode,
    simulate,
    events,
    clearEvents,
    previewOutcome,
    setPreviewOutcome,
    addToast,
  };
  return (
    <DryRunContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </DryRunContext.Provider>
  );
};

// --- UI Icons ---
const UserPlusIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125-1.125h-17.25Z"
    />
  </svg>
);
const HomeIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
    />
  </svg>
);
const BeakerIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c.251-.11.52-.168.794-.195M9.75 3.104c-.251-.11-.52-.168-.794-.195m2.408 7.234c.11.253.168.52.195.794m0 0a2.25 2.25 0 0 1-1.591.659l-5.714 0m8.109-8.109c.11.253.168.52.195.794m0 0a2.25 2.25 0 0 0-1.591.659l-5.714 0M14.25 8.896l4.563-2.281c.33-.165.734-.165 1.064 0l.091.046c.33.165.33.623 0 .787l-4.563 2.281m-1.5-1.5Z"
    />
  </svg>
);
const BrainIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21a9 9 0 100-18 9 9 0 000 18z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 12a3 3 0 100-6 3 3 0 000 6z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12h.01" />
  </svg>
);
const BoltIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
    />{" "}
  </svg>
);
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
    />{" "}
  </svg>
);
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
    />{" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />{" "}
  </svg>
);
const MinusIcon: FC<{ className?: string }> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
  </svg>
);
const ArrowsPointingOutIcon: FC<{ className?: string }> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
    />
  </svg>
);

// --- UI Theming ---
const THEME = {
  modes: {
    dry: {
      name: "Dry Run",
      Icon: BeakerIcon,
      description: "Simulate operations without side-effects.",
      gradient: "from-cyan-400 to-blue-500",
      textColor: "text-cyan-300",
      borderColor: "border-cyan-500/80",
      toBg: "to-cyan-900/40",
      glow: "from-cyan-500",
      shadow: "shadow-cyan-500/50",
      /** 👉 add this: used by border-t- and text-color helpers */
      color: "cyan",
    },
    live: {
      name: "Live",
      Icon: BoltIcon,
      description: "Actions are permanent & executed.",
      gradient: "from-lime-400 to-green-500",
      textColor: "text-lime-300",
      borderColor: "border-lime-500/80",
      toBg: "to-green-900/40",
      glow: "from-green-500",
      shadow: "shadow-green-500/50",
      color: "lime",
    },
    healing: {
      name: "Healing",
      Icon: SparklesIcon,
      description: "Execute and gracefully suppress errors.",
      gradient: "from-fuchsia-500 to-purple-600",
      textColor: "text-fuchsia-300",
      borderColor: "border-fuchsia-500/80",
      toBg: "to-purple-900/40",
      glow: "from-purple-500",
      shadow: "shadow-purple-500/50",
      color: "fuchsia",
    },
    preview: {
      name: "Preview",
      Icon: EyeIcon,
      description: "Instantly view UI states with stub data.",
      gradient: "from-amber-400 to-orange-500",
      textColor: "text-amber-300",
      borderColor: "border-amber-500/80",
      toBg: "to-orange-900/40",
      glow: "from-orange-500",
      shadow: "shadow-orange-500/50",
      color: "amber",
    },
  },
};

// --- DryRunDashboard Component ---
const DryRunDashboard: FC = () => {
  const { mode, setMode, events, previewOutcome, setPreviewOutcome } =
    useDryRun();
  const [activeTab, setActiveTab] = useState<"controls" | "events">("controls");
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const selectedEvent = events.find((e) => e.id === selectedEventId);

  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth - 450,
    y: window.innerHeight - 520,
  });
  const [size, setSize] = useState({ width: 420, height: 480 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const currentDetails = THEME.modes[mode];

  const onDragMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(".no-drag")) return;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    document.body.style.userSelect = "none";
  };

  const onResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsResizing(true);
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y,
        });
      }
      if (isResizing) {
        setSize({
          width: Math.max(380, e.clientX - position.x),
          height: Math.max(250, e.clientY - position.y),
        });
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, position.x, position.y]);

  return (
    <div
      ref={panelRef}
      className={`fixed font-sans rounded-2xl bg-gray-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl transition-all duration-300 ease-in-out ${
        isDragging ? "cursor-grabbing shadow-2xl" : ""
      }`}
      style={{
        top: position.y,
        left: position.x,
        width: size.width,
        height: isMinimized ? "auto" : size.height,
      }}
    >
      <div
        className={`absolute -inset-8 bg-gradient-to-br ${currentDetails.glow} to-transparent rounded-full blur-3xl opacity-30 -z-10 animate-pulse-slow transition-all duration-700`}
      ></div>
      <div
        className={`absolute border rounded-2xl inset-0 border-t-${currentDetails.color}-400/50 border-l-${currentDetails.color}-400/50 border-r-purple-500/30 border-b-purple-500/30 pointer-events-none`}
      ></div>

      <div
        className="flex items-center justify-between p-3 cursor-grab"
        onMouseDown={onDragMouseDown}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${currentDetails.gradient}`}
          >
            <currentDetails.Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-md text-white">DevTools</h2>
            <p
              className={`text-xs ${
                isMinimized
                  ? `text-${currentDetails.color}-300`
                  : "text-gray-400"
              }`}
            >
              {isMinimized
                ? `Mode: ${currentDetails.name}`
                : "Simulation & Event Inspector"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 no-drag">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 text-gray-400 rounded-full hover:bg-white/10 hover:text-white transition-all"
          >
            {isMinimized ? (
              <ArrowsPointingOutIcon className="w-4 h-4" />
            ) : (
              <MinusIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isMinimized ? "h-0 overflow-hidden" : "h-full flex flex-col"
        }`}
      >
        <div className="flex-grow flex flex-col min-h-0 border-t border-white/10">
          <div className="flex-shrink-0 flex p-2 gap-1 border-b border-white/10">
            <button
              onClick={() => setActiveTab("controls")}
              className={`px-3 py-1 text-xs rounded-md font-semibold transition-colors ${
                activeTab === "controls"
                  ? `bg-white/10 text-white`
                  : "text-gray-400 hover:bg-white/5"
              }`}
            >
              Controls
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`px-3 py-1 text-xs rounded-md font-semibold transition-colors ${
                activeTab === "events"
                  ? `bg-white/10 text-white`
                  : "text-gray-400 hover:bg-white/5"
              }`}
            >
              Event Log ({events.length})
            </button>
          </div>
          <div className="flex-grow overflow-y-auto">
            {activeTab === "controls" && (
              <div className="p-3 space-y-4 text-sm animate-fade-in">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Execution Mode
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {DRY_RUN_MODES.map((m) => {
                    const details = THEME.modes[m];
                    const isActive = mode === m;
                    return (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`p-3 rounded-lg border text-left transition-all duration-200 group relative overflow-hidden ${
                          isActive
                            ? `bg-gray-700/50 border-${details.color}-500/80`
                            : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                        }`}
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${
                            details.gradient
                          } opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
                            isActive ? "opacity-20" : ""
                          }`}
                        ></div>
                        <div
                          className={`relative z-10 font-bold text-${details.color}-300`}
                        >
                          {details.name}
                        </div>
                        <p className="relative z-10 text-xs text-gray-400 mt-1">
                          {details.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {mode === "preview" && (
                  <div className="border-t border-white/10 pt-3 space-y-2">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                      Preview Outcome
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewOutcome("success")}
                        className={`w-full py-1.5 rounded-md text-sm transition-colors ${
                          previewOutcome === "success"
                            ? "bg-green-600/80 text-white"
                            : "bg-gray-700/50 hover:bg-gray-700"
                        }`}
                      >
                        Success
                      </button>
                      <button
                        onClick={() => setPreviewOutcome("failure")}
                        className={`w-full py-1.5 rounded-md text-sm transition-colors ${
                          previewOutcome === "failure"
                            ? "bg-red-600/80 text-white"
                            : "bg-gray-700/50 hover:bg-gray-700"
                        }`}
                      >
                        Failure
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === "events" && (
              <div className="flex h-full">
                <div className="w-2/5 border-r border-white/10 overflow-y-auto">
                  {events.map((event) => {
                    const statusColors: Record<
                      SimulatedEvent["status"],
                      string
                    > = {
                      success: "border-green-400",
                      failure: "border-red-400",
                      retrying: "border-yellow-400",
                      simulated: "border-cyan-400",
                      previewed: "border-purple-400",
                    };
                    return (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEventId(event.id)}
                        className={`p-2 cursor-pointer border-l-4 transition-colors ${
                          selectedEventId === event.id
                            ? `bg-white/10 ${statusColors[event.status]}`
                            : "border-transparent hover:bg-white/5"
                        }`}
                      >
                        <div className="font-semibold text-white text-xs truncate">
                          {event.label}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {event.status.toUpperCase()} @{" "}
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="w-3/5 p-3 overflow-y-auto text-xs text-gray-300">
                  {selectedEvent ? (
                    <div className="space-y-3">
                      <div>
                        <strong className="text-gray-400 uppercase text-[10px] tracking-wider">
                          Label
                        </strong>
                        <p>{selectedEvent.label}</p>
                      </div>
                      {selectedEvent.error && (
                        <div>
                          <strong className="text-red-400 uppercase text-[10px] tracking-wider">
                            Error
                          </strong>
                          <p className="text-red-400 font-mono break-all">
                            {selectedEvent.error}
                          </p>
                        </div>
                      )}
                      {selectedEvent.result !== undefined && (
                        <div>
                          <strong className="text-green-400 uppercase text-[10px] tracking-wider">
                            Result
                          </strong>{" "}
                          <pre className="bg-black/20 p-2 rounded mt-1 text-green-300 text-[11px] whitespace-pre-wrap break-all">
                            {JSON.stringify(selectedEvent.result, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Select an event
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize no-drag opacity-30 hover:opacity-100 transition-opacity"
          onMouseDown={onResizeMouseDown}
        >
          <div className="w-full h-full border-r-2 border-b-2 border-white/50"></div>
        </div>
      </div>
    </div>
  );
};

// =================================================================================
// 3. APPLICATION SHELL
// =================================================================================
type Page = "home" | "createUser" | "workbench"; // ⬅️ add "workbench"

const DynamicHeader: FC = () => {
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

const AppContent: FC = () => {
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

  const UserCreationForm: FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("Ada Lovelace");

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

  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-200 font-sans">
      <div
        className={`absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 ${currentTheme.toBg} transition-all duration-700 -z-10`}
      ></div>
      <div className="absolute inset-0 bg-grid opacity-5 -z-10"></div>

      <div className="relative isolate flex flex-col items-center justify-between p-6 md:p-8 min-h-screen">
        <DynamicHeader />

        <main className="w-full max-w-6xl flex-grow flex flex-col justify-center items-center p-4 z-10">
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
              className={`px-5 py-2 rounded-lg flex items-center gap-3 font-semibold transition-colors text-gray-400 hover:bg-white/5`}
            >
              <BrainIcon className="w-5 h-5" />
              Workbench
            </button>
          </nav>

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
          {page === "createUser" && <UserCreationForm />}
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

// =================================================================================
// 4. TOP-LEVEL EXPORT
// =================================================================================
export default function App() {
  return (
    <DryRunProvider>
      <AppContent />
    </DryRunProvider>
  );
}
