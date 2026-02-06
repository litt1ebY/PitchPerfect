# PitchPerfect: 2026 Sports Performance Agent

PitchPerfect is a high-performance football match tracking Progressive Web Application (PWA). It is designed to be a proactive sports agent rather than a simple database.

## 🚀 The MVP (Current Phase)
The core goal is to capture match data (goals, assists, venue, opponent) with zero friction using AI and ensure it is never lost.

### 🛠 Core Features
- **Magic Entry Portal**: A multi-modal "dropzone" where you can type a sentence or record a voice note to log a match using Gemini 3 Flash.
- **Link-up Intelligence**: Track who assisted your goals and who you provided assists to.
- **Elite Dashboard**: Real-time stats (Goals, Assists, Season Rating) with high-end sports broadcast aesthetics.
- **Local-First Persistence**: Data is stored directly in the browser and persists across refreshes.

## 🗺 Documentation
- **[PLAN.md](./PLAN.md)**: Roadmap, MVP definition, and development phases.
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Technical system design, data flow, and technology stack details.

## 🔒 Data Safety
All data is stored in the browser's `localStorage`. You can clear it by resetting the app or browser cache. Current version includes CSV export for manual backups.
