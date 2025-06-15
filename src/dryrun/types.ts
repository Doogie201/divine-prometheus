// src/types.ts

/**
 * Defines the possible operational modes for the entire simulation environment.
 */
export type DryRunMode = "live" | "dry" | "healing" | "preview";

/**
 * A runtime constant array of all available modes.
 * Essential for iterating and building UI controls dynamically.
 */
export const DRY_RUN_MODES: DryRunMode[] = [
  "live",
  "dry",
  "healing",
  "preview",
];

/**
 * Defines the shape for providing mock data in 'preview' mode.
 * This is crucial for testing UI states without actual logic.
 */
export interface StubData<T> {
  success: T;
  failure: Error;
}

/**
 * Defines the optional configuration object for the `simulate` function,
 * allowing for advanced control over its execution.
 */
export interface SimulateOptions<T> {
  /** The number of times to retry the operation upon failure. Defaults to 0. */
  retries?: number;
  /** The stubbed data to use when the environment is in 'preview' mode. */
  stub?: StubData<T>;
}

/**
 * Represents a single, detailed log entry for an event captured by the simulator.
 * This is the data structure for the event log in the dashboard.
 */
export interface SimulatedEvent {
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

/**
 * Defines the shape for a toast notification message, used for user feedback.
 */
export type ToastMessage = {
  id: number;
  type: "success" | "error" | "info";
  message: string;
  title: string;
};

/**
 * Defines the analysis result from the PromptEngine.
 * This structure holds the breakdown of a user's raw prompt.
 */
export interface PromptAnalysis {
  original: string;
  cleaned: string;
  detectedLanguage: string;
  intent: string;
  missingPieces: string[];
  clarityScore: number;
  recommendations: string[];
}

/**
 * Defines the enhanced prompt result from the PromptEngine.
 */
export interface EnhancedPrompt {
  metaPrompt: string;
  reasoning: string[];
}

/**
 * Represents a single saved entry in the user's Prompt Vault.
 */
export interface VaultEntry {
  ts: number;
  raw: string;
  meta: EnhancedPrompt;
}

/**
 * Defines the complete contract for the DryRunContext. This is the API
 * that all components will use to interact with the simulation environment.
 */
export interface DryRunContextType {
  mode: DryRunMode;
  setMode: (mode: DryRunMode) => void;
  simulate: <T>(
    label: string,
    operation: () => Promise<T>,
    options?: SimulateOptions<T>
  ) => Promise<T>;
  events: SimulatedEvent[];
  clearEvents: () => void;
  previewOutcome: "success" | "failure";
  setPreviewOutcome: (outcome: "success" | "failure") => void;
  addToast: (toast: Omit<ToastMessage, "id">) => void;
}
