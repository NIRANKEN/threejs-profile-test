# Palette's UX Journal

## 3D Accessibility (A11y)
- **Keyboard Navigation & Screen Readers**: When implementing interactive objects in the 3D canvas (e.g. using `onClick` on meshes), they lack native keyboard focus and screen reader descriptions. A common and recommended pattern to fix this is to embed an `@react-three/drei` `<Html>` component nearby.
- **Pattern**: Add a visually hidden `<button>` inside `<Html style={{ opacity: 0 }}>` with an appropriate `aria-label`. Connect the same `onClick` handler.
- **Event Handling**: When sharing `onClick` between Three.js meshes and standard React DOM elements (like the embedded HTML button), update the event handler signature to handle both parameter types: `e?: ThreeEvent<MouseEvent> | React.MouseEvent`, and safely call `e?.stopPropagation?.()`.
