# Divine Prometheus

Divine Prometheus is an experimental React + TypeScript project showcasing advanced AI tooling. The codebase includes a **DryRun** environment for testing application logic without side effects and an **EchoMind** workbench for refining AI prompts. Together they provide a playground for exploring prompt engineering and simulated execution flows.

## Setup

```bash
npm install
npm install --save-dev @rollup/rollup-linux-x64-gnu \
  lightningcss-linux-x64-gnu \
  @tailwindcss/oxide-linux-x64-gnu
npm run dev   # start Vite development server
npm run build # compile TypeScript and build for production
npm run css:build # generate dist/tailwind.css using PostCSS
```

## Architecture Overview

- `src/dryrun/` – Components supporting the DryRun environment. `DryRunProvider` manages simulation state and `DryRunDashboard` visualizes events.
- `src/echomind/` – The prompt tooling suite. `PromptEngine` analyzes and enhances prompts while `PromptWorkbench` offers an interactive UI to experiment with prompt strategies.

## Pre-commit Hooks

This repository uses [pre-commit](https://pre-commit.com/) for linting, formatting, and TypeScript checks. Run `pre-commit install` once to enable Git hooks, or manually execute `pre-commit run --all-files` before committing.

## Testing

The project currently has a placeholder test script. Run `npm test` to execute it. Continuous integration also runs pre-commit hooks and the test script.
