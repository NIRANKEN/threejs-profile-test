## UX Improvement: 3D Object Accessibility
- **Date:** 2026-09-05
- **Context:** R3F InteractiveObject components represent clickable sections but were entirely opaque to screen readers and keyboard navigation.
- **Action:** Added a visually hidden `<button>` embedded within a Drei `<Html>` component (`opacity: 0`, `distanceFactor: 10`) to each `InteractiveObject`.
- **Impact:** Screen readers can now announce 'View [section]' for clickable 3D objects, and users navigating with keyboards can Tab onto these items, which will properly trigger the object highlight (via `onFocus`/`onBlur`) and interaction (via `onClick`).
- **Principle:** '滑らかさはアクセシビリティの一部です。' (Smoothness is part of accessibility). Bringing standard DOM a11y mechanisms directly into the 3D canvas bridging the gap between graphical space and assistive tech.
