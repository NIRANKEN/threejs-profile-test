# Three.js Profile Project Guide

## Build & Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Build project |
| `npm run type-check` | Type check |
| `npm run lint` | Lint |

## Agent Roles & Expertise

When performing tasks, refer to the following specialized guides:

- **Architecture/Refactoring:** `.claude/agents/architect.md`
- **3D/Three.js/Animation:** `.claude/agents/threejs-specialist.md`
- **UI/UX/Tailwind/CSS:** `.claude/agents/ui-reviewer.md`

## Standard Workflows for AI

AI Agents (Claude Code, Jules) should follow these sequences:

### 1. Adding an Experimental Feature

1. **Analyze:** Read `.claude/agents/threejs-specialist.md` to understand optimization requirements.
2. **Create:** Create a new file in `src/scene/objects/experiments/[FeatureName].tsx`.
3. **Register:** Add a toggle for this component in `src/scene/DevTools.tsx`.
4. **Test:** Run `npm run type-check` and ensure no performance warnings.

### 2. Updating Core Portfolio

1. **Plan:** Consult `.claude/agents/architect.md` before making any changes to the scene graph.
2. **Review:** After implementation, run a self-review using `.claude/agents/ui-reviewer.md` criteria.

## Component Rules

| Type | Location |
|---|---|
| 3D Objects | `src/scene/objects/` |
| Experiments | `src/scene/objects/experiments/` |
| Hooks | `src/hooks/` |
| State | `src/store/` |
| Assets (.glb) | `public/models/` |

## Coding Standards

- Use `camelCase` for variables/functions, `PascalCase` for components.
- **Strict TypeScript:** No `any` types.
- **Performance:** Always use `useFrame` for animations with pooling for math objects.
