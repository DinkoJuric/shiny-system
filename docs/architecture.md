# System Architecture

## Overview
Synapse Spark is a client-side Single Page Application (SPA) built with React 19, TypeScript, and Vite. It follows a strict separation of concerns between the "Engine" (Math Logic) and the "UI" (React Components).

## Directory Structure
```
/
├── public/             # Static assets
├── src/
│   ├── components/     # React UI components
│   │   ├── common/     # Reusable UI atoms (Buttons, Inputs)
│   │   ├── screens/    # Full page views (Game, Settings)
│   │   └── widgets/    # Complex UI blocks (Leaderboard)
│   ├── engine/         # Pure TypeScript Business Logic
│   │   ├── AdaptiveEngine.ts    # Difficulty scaling
│   │   ├── ProblemGenerator.ts  # Math generation
│   │   └── DiagnosticEngine.ts  # Error analysis
│   ├── store/          # State Management (Zustand)
│   ├── utils/          # Helper functions & Logger
│   ├── App.tsx         # Main entry component
│   └── main.tsx        # DOM mounting
```

## Key Technologies
- **Core**: React 19, TypeScript
- **Build**: Vite
- **State**: Zustand (Store), Persistent LocalStorage
- **Styling**: Tailwind CSS
- **Testing**: Vitest, React Testing Library

## Data Flow
1.  **User Action**: User enters a number and clicks "Submit".
2.  **Component**: `GameScreen` captures input.
3.  **Engine**: `DiagnosticEngine.analyze(input, problem)` is called.
4.  **Store**: `useGameStore` updates `score`, `streak`, and `history`.
5.  **UI Update**: React re-renders with new stats and feedback.

## Strict Rules (AAA Standard)
1.  **No Logic in UI**: Components should only display data and handle events. Math calculation belongs in `engine/`.
2.  **Type Safety**: No `any`. Strict null checks enabled.
3.  **Performance**: Memoize expensive calculations. Prevent unnecessary re-renders in the `GameScreen`.
