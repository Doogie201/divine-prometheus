import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { DryRunProvider } from "./dryrun/DryRunProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DryRunProvider>
      <App />
    </DryRunProvider>
  </React.StrictMode>
);
