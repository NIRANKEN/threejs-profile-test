# UX Journal

## 2024-05-20 - [Accessibility in 3D Space]

**Learning:**
3D objects in a WebGL Canvas lack DOM representation by default, which makes them completely invisible to screen readers and difficult to navigate using keyboards. While visual hover effects and pointer cursor changes provide visual feedback, they are insufficient for comprehensive accessibility.

**Action:**
Utilize `@react-three/drei`'s `<Html>` component to embed visually hidden HTML elements (like a `<button>`) near interactive 3D meshes. By setting `opacity: 0` inline, these elements do not occlude the visual scene but still remain in the DOM. This allows screen readers to announce the object's purpose via `aria-label` and enables keyboard users to tab to the object and trigger actions (e.g., hitting Enter to activate the 3D interaction), greatly enhancing the spatial UX.
