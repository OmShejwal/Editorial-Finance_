# Design System Specification: Editorial Financial Intelligence

## 1. Overview & Creative North Star
**Creative North Star: The Precision Curator**

In the world of high-stakes finance, "clean" is the baseline, but "authoritative" is the goal. This design system rejects the cluttered, line-heavy aesthetic of traditional enterprise software in favor of an **Editorial Precision** approach. 

We treat financial data like a premium broadsheet. By leveraging high-contrast typography scales (Manrope for displays, Inter for utility) and intentional white space, we create a "Digital Curator" experience. The system breaks the "template" look through **Tonal Layering**—abandoning 1px borders for sophisticated background shifts that guide the eye naturally toward critical fiscal insights.

---

## 2. Colors: Tonal Architecture
Our palette centers on deep, institutional blues and architectural grays. However, the application of these colors must follow a strict hierarchy to maintain a premium feel.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section content. Boundaries must be defined solely through background color shifts. Use `surface-container-low` for large section backgrounds and `surface-container-lowest` for the primary content cards sitting atop them. This creates a natural "wash" of color that defines structure without visual noise.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-transparent layers:
- **Base Level:** `surface` (#f9f9ff)
- **Secondary Layout Wash:** `surface-container-low` (#f1f3ff)
- **Primary Interaction Cards:** `surface-container-lowest` (#ffffff)
- **Floating Modals/Popovers:** `surface-bright` (#f9f9ff) with Glassmorphism.

### The "Glass & Gradient" Rule
To elevate CTAs beyond standard flat design, use a **Signature Texture**:
- **Primary Buttons/Actions:** A subtle linear gradient from `primary` (#27609d) to `primary_dim` (#145490).
- **Floating Navigation:** Use `surface_variant` at 80% opacity with a `backdrop-blur: 12px` to create a "frosted glass" effect that keeps the user grounded in their data context.

---

## 3. Typography: The Editorial Scale
We use a dual-typeface system to balance character with high-density legibility.

*   **Display & Headlines (Manrope):** Use these to provide an authoritative, editorial voice. The wide apertures of Manrope convey transparency and modernism. 
    *   *Display-LG (3.5rem):* Reserved for high-level portfolio totals.
    *   *Headline-SM (1.5rem):* Used for section headers to provide "breathing room" in data-heavy views.
*   **Body & Utility (Inter):** The workhorse of the system. 
    *   *Body-MD (0.875rem):* The standard for all data table entries.
    *   *Label-SM (0.6875rem):* Used for micro-data, like "Last Updated" timestamps or table headers, always in `on_surface_variant` to reduce visual weight.

---

## 4. Elevation & Depth: Atmospheric Layering
We move away from "drop shadows" toward "ambient occlusion."

*   **The Layering Principle:** Depth is achieved by "stacking" tiers. A card (Lowest) on a dashboard background (Low) creates a soft, natural lift.
*   **Ambient Shadows:** For floating elements (Modals, Tooltips), use an extra-diffused shadow: `box-shadow: 0 12px 40px rgba(20, 49, 97, 0.08)`. Note the use of the `on-surface` color (#143161) at a low opacity rather than pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a container boundary, use a "Ghost Border": `outline-variant` (#99b2e9) at 20% opacity. Never use 100% opaque borders.

---

## 5. Components: Financial Primitives

### Cards & Data Tables
*   **The Rule of Silence:** Forbid the use of divider lines between table rows or card sections. 
*   **Implementation:** Use a `2.5 (0.5rem)` vertical spacing scale to separate rows. Use a subtle background hover state (`surface-container-high`) to highlight the active data row.
*   **Status Badges:** Use `error_container` for negative trends and `primary_container` for positive, with a `9999px` (Full) roundedness. Use `on-error-container` for text to ensure AAA contrast.

### Buttons & Inputs
*   **Primary Action:** Roundedness `md (0.375rem)`. Uses the primary-to-primary-dim gradient.
*   **Form Fields:** Use `surface-container-low` as the background for input fields instead of white boxes with borders. This makes the "active" field (which flips to white) pop instantly.
*   **Interactive Chips:** Use for filtering large data sets. Default state is `secondary_container`; active state is `primary`.

### Specialized Financial Components
*   **The "Trend Micro-Graph":** Integrated directly into list items. Use `primary` for growth and `error` for loss. No axes, no labels—just a sparkline to provide instant visual trajectory.
*   **The Fiscal Summary Bar:** A thin, top-aligned element using `surface-tint` to indicate the current "mode" (e.g., Auditing vs. Planning).

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use `surface-container-highest` to emphasize a "Total" or "Final" value in a table.
*   **Do** use the `10 (2.25rem)` or `12 (2.75rem)` spacing tokens between major widgets to ensure the "Editorial" feel.
*   **Do** use `on-surface-variant` for secondary information to create a clear visual hierarchy.

### Don’t:
*   **Don't** use 1px gray borders to separate sidebar navigation from the main content. Use a background shift to `surface-dim`.
*   **Don't** use pure black (#000000) for text. Always use `on-surface` (#143161) to maintain the deep blue professional tone.
*   **Don't** cram data. If a table feels tight, increase the row height using the `8 (1.75rem)` spacing token rather than adding lines.

---

## 7. Token Summary Reference
*   **Radius:** Primary cards use `lg (0.5rem)`, inputs use `md (0.375rem)`.
*   **Typography:** Headlines = Manrope; Body/Data = Inter.
*   **Transition:** All hover states should use a `200ms ease-out` on background-color shifts.