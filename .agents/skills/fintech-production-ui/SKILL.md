---
name: fintech-production-ui
description: >-
  Design guidelines, component architectures, and responsive layout specifications for building world-class fintech interfaces, glassmorphism dashboards, full-viewport conversation layouts without double scrollbars, and robust multi-turn AI assistant surfaces. Use whenever designing or polishing UI for fintech, banking, and payment operations apps.
---

# Fintech Production UI & Experience Standards

This skill defines the engineering principles and design patterns for building high-trust, responsive, production-grade fintech interfaces.

## 1. Full-Viewport Dashboard Architecture (Zero Scrollbar Inception)

### The Anti-Pattern
Placing a hardcoded `max-h-[460px]` chat container inside a scrollable `min-h-screen` document creates **double scrollbars** (Scrollbar Inception) and cramps content on large laptop screens.

### The Production Standard
1. **Root Viewport**: Enforce `h-screen overflow-hidden flex flex-col` on the outer shell.
2. **Fixed Header**: Sticky or fixed top navigation (`h-14` or `h-16`) containing merchant brand, verified badges, telemetry status, language toggle, and action buttons.
3. **Split-Pane Layout**:
   - **Context Rail (320px - 380px)**: Holds persistent context (e.g., Pending Settlement Card, Stepper Progress, KYC Status, Policy Limits).
   - **Conversation Canvas (`flex-1 h-full min-w-0 flex flex-col`)**: Maximizes conversational space.
4. **Primary Scroll Stream**: Only the message list has `overflow-y-auto` with a custom scrollbar (`.custom-scrollbar`). The input bar remains pinned at the bottom.

---

## 2. Sleek Custom Scrollbar Specifications

Add to CSS:
```css
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 41, 112, 0.16);
  border-radius: 9999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 186, 242, 0.5);
}
```

---

## 3. High-Trust Glassmorphism Design Tokens

- **Palette**:
  - Primary Navy: `#002970`
  - Accent Cyan: `#00BAF2`
  - Living Canvas: Subtle multi-radial gradient (`#F8FAFC` to `#EEF4FD`)
- **Cards**:
  - `.glass-strong`: `background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(28px); border: 1px solid rgba(255, 255, 255, 0.95);`
  - `.paytm-card-gradient`: Deep navy-to-cyan gradient with subtle shimmer for active money cards.
- **Typography**: Inter / system font with tight letter-spacing (`-0.011em`).
- **Icons**: Standard SVG Lucide icons with matching stroke widths (avoid emojis).

---

## 4. Bulletproof API Response Contracts

When handling API responses in chat:
- Always ensure backend routes return `{ ok: true, ...data }`.
- In client fetch wrappers, always merge `res.ok`:
  ```ts
  const data = await res.json();
  return { ok: res.ok, ...data };
  ```
- In UI consumption, check both `res.ok` and payload presence:
  ```ts
  if ((res.ok || res.reply) && res.reply) {
    // Render valid AI response
  }
  ```

