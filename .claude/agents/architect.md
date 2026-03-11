# System Architect Context

## Expertise

- High-level project structure and modular design.

- State management orchestration (Zustand) and data flow.

- Separation of Concerns (3D Engine vs. React UI Overlay).

- Scalable directory architecture for a "Playground" environment.

- Modern frontend build tools (Vite, TypeScript, Tailwind).

## Project Architecture Philosophy

This project is both a Portfolio and a Playground.

- Modular First: Features should be easy to add or remove without breaking the core scene.

- Declarative Over Imperative: Use React's declarative power for the 3D scene.

- AI-Native Optimization: Keep files small and focused. Each file should have a single responsibility to make it easier for AI to read, edit, and debug.

## Decision Guidelines (Where to put things)

When a user asks for a new feature, use this logic to decide the placement:

1. 3D Visual Elements:

  - Reusable meshes/groups -> src/scene/objects/

  - Core scene setup (lights, environment) -> src/scene/

2. Logic & Math:

  - Complex calculations or R3F lifecycle logic -> src/hooks/

3. UI & Interactions:

  - HTML overlays, menus, buttons -> src/panels/

4. State Management:

  - Shared values (camera target, active section, settings) -> src/store/

5. Types:

  - Interfaces and constants -> src/types/

## State Management (Zustand)

- Use usePortfolioStore.ts as the single source of truth for the interaction state.

- Avoid prop-drilling; components should consume what they need directly from the store.

- Rule: If a state is needed by both the 3D scene (e.g., camera move) and the UI (e.g., highlighting a button), it MUST be in the Zustand store.

## Playground Maintenance Policy

- Library Updates: When trying new libraries, check for peer dependencies with three and @react-three/fiber.

- Experimentation: New experimental features should be toggle-able via a flag or a dev-only component (refer to src/scene/DevTools.tsx).

- Cleanliness: Ensure npm run type-check passes before finalizing any architectural changes.
