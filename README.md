# Loom UI CLI

Loom UI is a powerful Command Line Interface (CLI) tool designed to help developers quickly add customizable components to their projects. It streamlines the process of setting up and managing UI components in your application.

## Installation

To install Loom UI globally, run the following command:

```bash
npm install @venusai/loom-ui
```

## Tech Stack

- Node.js
- TypeScript
- Commander.js (for CLI structure)
- Chalk (for colorful console output)
- Ora (for spinner animations)
- Prompts (for interactive prompts)
- Zod (for configuration validation)
- Cosmiconfig (for configuration file loading)

## Configuration

Loom UI uses a `components.json` file for configuration. If this file doesn't exist, it will be created with default settings when you run the `init` command.

The configuration file includes:

- Style preferences
- Tailwind CSS settings
- Alias paths for components and utilities

You can manually edit this file to customize your setup.

The default configuration looks like this:

```json
{
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

You can customize these settings to match your project structure and preferences.

## Project Structure

After initialization, Loom UI will create the following structure in your project:

├── src/ <br/>
│ ├── components/ <br/>
│ │ └── loomui/ <br/>
│ │ └── (component files will be added here) <br/>
│ └── lib/ <br/>
│ └── utils.ts <br/>
└── components.json <br/>

This structure is created to organize your components and utility functions efficiently.
