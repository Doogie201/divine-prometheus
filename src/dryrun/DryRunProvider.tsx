import React, {
  useState,
  useRef,
  createContext,
  useContext,
  useEffect,
  type FC,
  type ReactNode,
} from "react";

// We will assume a central 'types.ts' file provides all necessary types.
// This keeps our provider clean and focused on logic.
import {
  type DryRunMode,
  type DryRunContextType,
  type SimulatedEvent,
  type SimulateOptions,
  type ToastMessage,
} from "./types";

// =================================================================================
// Context Definition
// =================================================================================
const DryRunContext = createContext<DryRunContextType | undefined>(undefined);

// =================================================================================
// Public Hook for Consumers
// =================================================================================
/**
 * The official hook to access the DryRun simulation context.
 * Any component calling this must be a descendant of `DryRunProvider`.
 */
export const useDryRun = () => {
  const context = useContext(DryRunContext);
  if (!context) {
    throw new Error("useDryRun must be used within a DryRunProvider");
  }
  return context;
};

// =================================================================================
// Canonical Provider Implementation
// =================================================================================
/**
 * Provides the complete DryRun simulation environment to its children.
 * This is the single source of truth for managing simulation state,
 * executing operations, and displaying feedback like events and toasts.
 */
export const DryRunProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // --- State Management ---
  const [mode, setModeState] = useState<DryRunMode>("dry");
  const [events, setEvents] = useState<SimulatedEvent[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [previewOutcome, setPreviewOutcome] = useState<"success" | "failure">(
    "success"
  );
  const eventIdCounter = useRef(0);

  // --- Toast Management ---
  const addToast = (toast: Omit<ToastMessage, "id">) => {
    // Add a new toast and limit the history to the last 5
    setToasts((prev) => [...prev.slice(-4), { ...toast, id: Date.now() }]);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Core Context Functions ---
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
    // Add new event to the top and limit history to 100 entries
    setEvents((prev) => [newEvent, ...prev.slice(0, 99)]);
  };

  const clearEvents = () => setEvents([]);

  const simulate = async <T,>(
    label: string,
    operation: () => Promise<T>,
    options: SimulateOptions<T> = {}
  ): Promise<T> => {
    const { retries = 0, stub } = options;
    // Sanitize the operation function for display in the log
    const operationString =
      operation.toString().substring(0, 200) +
      (operation.toString().length > 200 ? "..." : "");
    const baseEventData = { label, mode, operation: operationString, stub };

    // --- Handle 'preview' mode ---
    if (mode === "preview") {
      if (!stub) {
        const error = new Error(
          "Preview mode requires a 'stub' to be provided."
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

    // --- Handle 'dry' mode ---
    if (mode === "dry") {
      addEvent({
        ...baseEventData,
        status: "simulated",
        attempts: 1,
        result: "Operation was not executed.",
      });
      return Promise.resolve(undefined as unknown as T);
    }

    // --- Handle 'live' and 'healing' modes with retries ---
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

        // Log a retry attempt if it's not the last one
        if (!isLastAttempt) {
          addEvent({
            ...baseEventData,
            status: "retrying",
            attempts: i + 1,
            error: errorMessage,
          });
        } else {
          // Handle final failure
          if (mode === "healing") {
            console.warn(
              `[HEALING-MODE] Final attempt for "${label}" failed and was suppressed. Error:`,
              error
            );
            addEvent({
              ...baseEventData,
              status: "failure",
              attempts: i + 1,
              error: `HEALED: ${errorMessage}`,
            });
            return Promise.resolve(undefined as unknown as T); // Gracefully resolve
          } else {
            // Live mode
            addEvent({
              ...baseEventData,
              status: "failure",
              attempts: i + 1,
              error: errorMessage,
            });
            throw error; // Re-throw the error
          }
        }

        // Exponential backoff before next retry
        await new Promise((res) => setTimeout(res, Math.pow(2, i) * 150));
      }
    }

    // This part should be unreachable but is a fallback
    throw new Error("Simulation loop finished unexpectedly.");
  };

  // The value provided to all consumer components of the context.
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
      {/* The ToastContainer is part of the provider system, so it's always available */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </DryRunContext.Provider>
  );
};

// =================================================================================
// Self-Contained Toast UI Components
// These live with the provider as they are integral to its operation.
// =================================================================================

// --- Icons for Toasts (Minimal inline SVGs) ---
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
  // Auto-dismiss toast after 5 seconds
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
