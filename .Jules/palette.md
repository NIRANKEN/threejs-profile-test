# Palette's Journal

## 3D Spatial UX Quirks & A11y Improvements

**Observation:**
In a 3D Canvas, purely visual objects (like a `THREE.Mesh` or `<group>`) lack native DOM semantics. While `onClick` or `onPointerOver` on a mesh might work for mouse users, they remain completely invisible to screen readers and inaccessible to keyboard-only users navigating via Tab.

**UX Improvement (A11y):**
By utilizing `@react-three/drei`'s `<Html>` component, we can embed a visually hidden DOM element (such as `<button className="sr-only">`) within the 3D scene that corresponds to an interactive 3D object.

**Implementation Details:**
- Added a `<button>` inside an `<Html>` component to `InteractiveObject.tsx`.
- The button is styled with a `.sr-only` class to ensure it doesn't disrupt the visual flow of the scene but remains accessible in the accessibility tree.
- Attached `onFocus` and `onBlur` handlers to the button to visually highlight the corresponding 3D object when navigated to via keyboard (Tab).
- Added `onKeyDown` support for keyboard activations (`Enter` or `Space` key).
