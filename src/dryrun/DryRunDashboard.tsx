import React, { useState, useEffect, useRef, type FC, useContext } from "react";

// For this component to work, it's assumed that a central `App.tsx` provides the
// DryRunProvider and that a `types.ts` file exists with these definitions.
// To make this file runnable in isolation for preview, we'll include mock types and context.

// --- START: Mock Types & Context for Isolated Preview ---
type DryRunMode = "live" | "dry" | "healing" | "preview";
const DRY_RUN_MODES: DryRunMode[] = ["live", "dry", "healing", "preview"];
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
}
interface DryRunContextType {
  mode: DryRunMode;
  setMode: (mode: DryRunMode) => void;
  events: SimulatedEvent[];
  clearEvents: () => void;
  previewOutcome: "success" | "failure";
  setPreviewOutcome: (outcome: "success" | "failure") => void;
}
const DryRunContext = React.createContext<DryRunContextType | undefined>(
  undefined
);
const useDryRun = () => {
  const ctx = useContext(DryRunContext);
  if (!ctx) {
    // Fallback to a mock context for isolated viewing:
    const [mode, setMode] = useState<DryRunMode>("dry");
    const [previewOutcome, setPreviewOutcome] = useState<"success" | "failure">(
      "success"
    );
    // Note the explicit `error: undefined` and cast to SimulatedEvent
    const stubEvent: SimulatedEvent = {
      id: 0,
      label: "Mock Event",
      mode: "dry",
      timestamp: new Date().toISOString(),
      status: "simulated",
      operation: "() => {}",
      attempts: 1,
      result: "Mocked Result",
      error: undefined,
    };
    return {
      mode,
      setMode,
      previewOutcome,
      setPreviewOutcome,
      events: [stubEvent],
      clearEvents: () => console.log("clearEvents"),
    };
  }
  return ctx;
};
// --- END: Mock Types & Context ---

// --- ICONS (Heroicons) ---
const BeakerIcon: FC<{ className?: string }> = ({ className }) => (
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
      d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c.251-.11.52-.168.794-.195m0 0c.251.11.52.168.794.195m-2.408 7.234c.11.253.168.52.195.794m0 0a2.25 2.25 0 0 1-1.591.659l-5.714 0m8.109-8.109c.11.253.168.52.195.794m0 0a2.25 2.25 0 0 0-1.591.659l-5.714 0M14.25 8.896l4.563-2.281c.33-.165.734-.165 1.064 0l.091.046c.33.165.33.623 0 .787l-4.563 2.281m-1.5-1.5Z"
    />
  </svg>
);
const BoltIcon: FC<{ className?: string }> = (props) => (
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
const SparklesIcon: FC<{ className?: string }> = (props) => (
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
const EyeIcon: FC<{ className?: string }> = (props) => (
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

// --- DESIGN & COLOR THEORY CONSTANTS ---
const MODE_DETAILS = {
  dry: {
    Icon: BeakerIcon,
    name: "Dry Run",
    description: "Simulate without side-effects.",
    color: "cyan",
    gradient: "from-cyan-400 to-blue-500",
    glow: "from-cyan-500",
  },
  live: {
    Icon: BoltIcon,
    name: "Live",
    description: "Actions are permanent & executed.",
    color: "green",
    gradient: "from-green-400 to-emerald-500",
    glow: "from-green-500",
  },
  healing: {
    Icon: SparklesIcon,
    name: "Healing",
    description: "Execute and gracefully suppress errors.",
    color: "purple",
    gradient: "from-purple-400 to-indigo-500",
    glow: "from-purple-500",
  },
  preview: {
    Icon: EyeIcon,
    name: "Preview",
    description: "Instantly view UI states with stub data.",
    color: "yellow",
    gradient: "from-yellow-400 to-orange-500",
    glow: "from-orange-500",
  },
};

// --- THE DYNAMIC DASHBOARD COMPONENT ---
const DryRunDashboard: React.FC = () => {
  const { mode, setMode, events, previewOutcome, setPreviewOutcome } =
    useDryRun();
  const [activeTab, setActiveTab] = useState<"controls" | "events">("controls");
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // State for dynamic interaction
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

  const currentDetails = MODE_DETAILS[mode];

  // Drag Handlers
  const onDragMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(".no-drag")) return; // Prevent drag on buttons
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    document.body.style.userSelect = "none";
  };

  // Resize Handlers
  const onResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsResizing(true);
    document.body.style.userSelect = "none";
  };

  // Global mouse move and up handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y,
        });
      }
      if (isResizing) {
        setSize((currentSize) => ({
          width: Math.max(380, e.clientX - position.x),
          height: Math.max(250, e.clientY - position.y),
        }));
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

      {/* Header / Drag Handle */}
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

      {/* Collapsible Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isMinimized ? "h-0 overflow-hidden" : "h-full flex flex-col"
        }`}
      >
        <div className="flex-grow flex flex-col min-h-0 border-t border-white/10">
          {/* Tabs */}
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

          {/* Content Pane */}
          <div className="flex-grow overflow-y-auto">
            {activeTab === "controls" && (
              <div className="p-3 space-y-4 text-sm animate-fade-in">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Execution Mode
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {DRY_RUN_MODES.map((m) => {
                    const details = MODE_DETAILS[m];
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
                {" "}
                <div className="w-2/5 border-r border-white/10 overflow-y-auto">
                  {" "}
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

        {/* Resize Handle */}
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

export default DryRunDashboard;
