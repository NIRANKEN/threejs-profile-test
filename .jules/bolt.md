## 2024-05-19 - [BakeShadows Optimization] **Learning:** Static scenes benefit heavily from BakeShadows. **Action:** Added BakeShadows when no dynamic lights or moving objects that cast shadows exist.

## 2024-05-19 - [Shared Highlight Material] **Learning:** Creating duplicate `THREE.MeshBasicMaterial` instances via `useMemo` in interactive objects causes unnecessary memory allocations and GC pauses. **Action:** Moved static, shared materials to the module level to reuse a single instance across all identical interactive components.
