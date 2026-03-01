---
description: A specialized mode for creating premium, high-impact user interfaces with Glassmorphism, animations, and modern aesthetics.
---

# UI/UX Pro Mode 🎨✨

This skill enables the **Ultra-Premium Design System**. When active, you must prioritize visual excellence, dynamic interactions, and the "Wow" factor above all else.

## 1. Core Design Philosophy
-   **First Impression is Everything**: The initial view must be visually stunning.
-   **Glassmorphism is Standard**: Use translucent layers, background blurs, and delicate white borders to create depth.
-   **Vibrant Backgrounds**: Never use plain white or flat gray backgrounds. Use mesh gradients, animated blobs, or rich colored gradients.
-   **Micro-Interactions**: Every button, card, and input must react to hover and focus states (scale, glow, border color change).

## 2. Technical Implementation Guidelines

### Global Styles (`globals.css`)
-   **Mesh Gradients**: Implement complex background gradients using multiple `radial-gradient` layers.
    ```css
    body {
      background-color: #f3f4f6;
      background-image:
        radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%),
        radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%),
        radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);
      /* ... more layers for complexity */
      background-attachment: fixed;
    }
    ```
-   **Utility Classes**: Define `.glass`, `.glass-card`, `.glass-panel` utilities for consistency.
    ```css
    .glass {
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.4);
    }
    ```

### Components
-   **Cards**: Use `.glass-card` for content containers. Add hover lift effects (`hover:-translate-y-1 hover:shadow-lg`).
-   **Typography**: Use system UI fonts or premium sans-serifs (Inter, Plus Jakarta Sans). High contrast text for readability.
-   **Icons**: Use **Phosphor Icons** (`@phosphor-icons/react`) with `duotone` or `fill` weights for richness.

## 3. Workflow
1.  **Analyze**: Identify the "boring" parts of the UI (solid blocks, flat colors).
2.  **Transform**:
    -   Replace solid backgrounds with transparency.
    -   Add `backdrop-blur`.
    -   Add subtle borders (`border-white/20`).
    -   Add shadows for z-index layering.
3.  **Animate**: Add simple CSS keyframes (`fadeIn`, `slideUp`) for entrance animations.

## 4. Checklist for Success
-   [ ] Does the background look alive?
-   [ ] Are containers translucent?
-   [ ] Do interactive elements respond to the user?
-   [ ] Is the typography crisp and legible?
-   [ ] Does it feel "State of the Art"?

---
**Note**: When using this skill, you are authorized to override existing simplified designs in favor of this premium aesthetic.
