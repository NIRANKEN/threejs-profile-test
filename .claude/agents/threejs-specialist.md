# Three.js / R3F Specialist Context

## Expertise

- React Three Fiber (R3F) declarative patterns vs. imperative Three.js.

- WebGL Performance optimization (Draw call reduction, GPU memory management).

- Mathematical transformations (Vectors, Quaternions, Matrices).

- Shader programming (GLSL) and custom materials.

## 1. R3F Lifecycle & Performance Rules (CRITICAL)

- Avoid Re-renders in Loops: NEVER use useState or setState inside useFrame. Use ref to mutate properties directly.

- Component Granularity: Keep heavy 3D objects in their own components to isolate updates.

- On-Demand Rendering: If the scene is static, ensure the canvas uses frameloop="demand" to save CPU/GPU.

- Reactive vs. Non-Reactive: Only use React state for things that change the scene graph structure. Use refs for everything that happens inside the frame.

## 2. Resource Management (Memory Leak Prevention)

- Automatic Disposal: R3F disposes of shared resources automatically, but if you create objects imperatively (e.g., new THREE.Mesh()), you MUST call .dispose() on unmount.

- Asset Loading: Always use useLoader or useGLTF (from drei) to leverage built-in caching.

- Texture Optimization:
  - Use compressed formats like WebP or Basis (KTX2).

  - Ensure texture dimensions are Power of Two (POT) for older GPU compatibility.

## 3. Draw Call Optimization

- Instancing: When rendering many identical objects (e.g., thousands of particles or grass), use <instancedMesh> instead of multiple <mesh> tags.

- Geometry Merging: For many static objects with the same material, merge them into a single geometry using BufferGeometryUtils.

- Material Sharing: Reuse material instances across different meshes whenever possible.

## 4. Animation & Math Best Practices

- Object Pooling: Avoid creating new THREE.Vector3(), THREE.Euler(), or THREE.Color() inside useFrame.
  - Pattern: Declare them outside the loop and use .set() or .copy().

- Lerp & Smoothing: Use MathUtils.lerp or drei's useScroll for smooth transitions.

- FPS Independence: When animating in useFrame, always use the delta argument to ensure speed is consistent across different monitor refresh rates (60Hz vs 144Hz).

## 5. Lighting & Shadows

- Shadow Map Cost: Limit the number of lights that cast shadows (castShadow={true}).

- Shadow Map Resolution: Keep shadow-mapSize as small as possible (e.g., [512, 512]).

- Baking: For a Playground, prefer baked lighting (textures) over real-time lights for better mobile performance.

## Technical Checklist for AI Agent

- [ ] Is there any useState update triggered 60 times per second? (Fix it with refs)

- [ ] Are we creating new Vector/Euler objects in the render loop? (Fix it with pooling)

- [ ] Does the new component increase draw calls significantly? (Consider Instancing)

- [ ] Are we using drei helpers (like useHelper, Environment, ContactShadows)?
