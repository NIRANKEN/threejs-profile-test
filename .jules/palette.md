# Palette's UX Journal

## 3D Spatial UX Quirks & Accessibility

### 1. Canvas Focus & Keyboard Navigation

- **Quirk**: 3D objects rendered via WebGL inside a `<Canvas>` are not natively accessible to the DOM, making keyboard navigation (Tab) and screen readers completely blind to them.
- **Improvement**: Embedded visually hidden but focusable `<button>` elements near interactive 3D objects using `@react-three/drei`'s `<Html>` component (`opacity: 0`).
- **Result**: Keyboard users can now Tab through the 3D scene. The hidden DOM buttons act as proxies for the 3D objects.

### 2. Synchronized Interaction States

- **Quirk**: When a proxy DOM button is focused via keyboard, the 3D scene needs to provide visual feedback, and vice-versa.
- **Improvement**: Linked the DOM button's `onFocus` and `onBlur` events directly to the 3D object's pointer hover state (`onPointerOver`/`onPointerOut`).
- **Result**: Tabbing to a hidden button now triggers the exact same 3D visual highlight as hovering over the object with a mouse. Screen readers will read out the `aria-label` associated with the button (e.g., "プロフィール詳細を表示"), successfully marrying spatial aesthetics with web accessibility standards.
