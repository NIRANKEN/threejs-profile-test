# Palette's Journal
## 3D Web UX & Accessibility Observations

### Smooth Interactions
In this 3D portfolio space, smooth interaction forms the core of an accessible and pleasant user experience. Abrupt changes in 3D can be disorienting.
We use `useFrame` in combination with `three`'s `MathUtils.lerp` to smoothly scale objects up to `1.05` when hovered. This provides a tactile response that confirms interactivity without relying solely on cursor changes, while strictly keeping mathematical logic inside `useFrame` to avoid GC stalls.

### Contextual Tooltips & Screen Reader Support
Users explore 3D space with different devices. To bridge the gap between visual discovery and accessibility:
- We utilize Drei's `<Html>` wrapper to place CSS-styled tooltips physically near the interactive 3D objects (e.g. above the Bed, Monitor, PC Case, and Book).
- These tooltips fade in gracefully upon hover.
- To ensure screen readers aren't left behind, we include an invisible `<button>` within the tooltip. This hidden button handles `onFocus` and `onBlur`, meaning keyboard-only users navigating via 'Tab' will trigger the same hover animations and text updates as mouse users.

### The Micro UX Philosophy
"Users notice details. In 3D Web, smoothness is part of accessibility."
By combining non-intrusive scale animations, descriptive contextual tooltips, and hidden semantic HTML labels, we give users confidence when exploring this 3D room.
