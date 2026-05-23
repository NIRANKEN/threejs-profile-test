# Palette's UX Journal

## 3D Spatial UX Quirks & Accessibility Learnings

### InteractiveObject Scale Feedback & A11y
* **Insight:** 3D objects lack native keyboard focus and screen reader announcements. Users often find it unclear which items in a scene are interactable, and keyboard/screen-reader users are completely locked out without additional HTML overlays.
* **Action:** Added `@react-three/drei` `<Html>` component with a visually hidden `<button>` placed near the `InteractiveObject`. Tied the button's `onFocus` and `onBlur` events directly to the `handlePointerOver` and `handlePointerOut` logic to trigger the hover state for keyboard users.
* **Polish:** Added smooth scale interpolation (`THREE.MathUtils.lerp`) inside the `useFrame` hook to gently scale up the object on hover. This avoids harsh snaps and reinforces the idea that "smoothness is an accessibility feature in 3D Web."
