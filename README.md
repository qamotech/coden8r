# ⚙️💻 CodeN8R

**Browser coding studio with editor and preview panels, starter templates, snapshots, import/export tools, and configurable AI-assistant workflows.**

🏷️ Maintained in [qamotech/coden8r](https://github.com/qamotech/coden8r) · 🌐 Public repository

## ✨ What is here

- 📝 Editor, preview, console, command palette, and find/replace controls.
- 🧩 Starter templates for web apps, dashboards, games, and UI components.
- 📦 Import/export, ZIP controls, project checks, and version snapshots.
- 🤖 AI action presets for explanations, refactoring, tests, and documentation.

## 🧭 Try the project

Choose a starter, edit a small section, run the preview, inspect diagnostics, and export a copy. Configure an AI connection separately if you want provider-backed assistance.

## 🚀 Local setup

```sh
git clone https://github.com/qamotech/coden8r.git
cd coden8r
```

Use a current browser. Serve the repository root to preserve relative assets and a stable browser origin:

```sh
python -m http.server 8000
```

Open `http://localhost:8000/index.html`. Keep related assets beside the entry file. No npm setup is declared in the inspected repository.

## 🗂️ Source map

- 📄 [`IDE-ENHANCEMENT-ROADMAP.md`](IDE-ENHANCEMENT-ROADMAP.md)
- 📄 [`editor-helpers.js`](editor-helpers.js)
- 📄 [`gateway-helpers.js`](gateway-helpers.js)
- 📄 [`index.html`](index.html)
- 📄 [`tests`](tests) — source directory

## ⚙️ Configuration & data

AI actions require a working provider configuration. A browser terminal or diagnostic panel is not necessarily a native shell. Do not put private credentials into source files or exported projects.

Keep credentials, private exports, customer records, and personal information out of commits and screenshots. A local browser demo is not evidence of account security, reliable persistence, or connected external services. Preserve exports before changing storage keys or resetting an application.

## 🧪 Verification checklist

- 🔎 Confirm the entry file and asset paths above exist in your checkout.
- ▶️ Start the documented runtime and inspect browser or terminal errors.
- 🧭 Exercise the project-specific workflow described above using sample data.
- 📱 Check narrow and wide layouts when the project has a browser interface.
- 💾 Verify save/export and recovery behavior before trusting important work to it.
- 📝 Record the exact command, browser, operating system, and outcome of your checks.

This guide was prepared from repository files and manifests. It does not claim a fresh build, deployment, security audit, or full functional test of this project.

## 🤝 Contributions & useful reports

Keep changes focused and explain the user-visible result. Preserve existing assets and configuration unless a change requires updating them. Include reproduction steps, expected and actual behavior, and relevant screenshots with personal information removed. For UI work, include the viewport and browser; for runtime issues, include the command and error text.

## 🛠️ Maintenance priorities

- 📚 Keep this guide aligned with implemented behavior and current entry points.
- 🧪 Add or maintain checks for the core workflow before expanding features.
- ♿ Review labels, keyboard navigation, contrast, and responsive layout.
- 📦 Document external services, asset rights, and deployment prerequisites.

## 📜 Licensing & attribution

This documentation update does not grant a new software or asset license. Consult existing license files, source headers, package metadata, and original asset terms; resolve inconsistencies with the owner before redistribution. Third-party names and resources retain their own terms.
