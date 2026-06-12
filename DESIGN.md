---
name: InjuryGuide
description: AI-assessed sports injury recovery — criteria-based rehab plans for athletes who need a clear next step today.
colors:
  primary: "#3B7DD8"
  primary-dark: "#2D68C0"
  primary-dim: "#EAF1FB"
  canvas: "#EEF6FF"
  bg-2: "#DCECFb"
  bg-3: "#C8E0F8"
  surface: "#FFFFFF"
  ink: "#0F1B2E"
  ink-2: "#243550"
  ink-3: "#3D5878"
  muted: "#6080A0"
  faint: "#90AACC"
  line: "#C8DCF5"
  green: "#18A05A"
  amber: "#E8A020"
  red: "#D94F4F"
  blue-accent: "#5AABDE"
  purple: "#7C6FD4"
typography:
  display:
    fontFamily: "Space Grotesk, Inter, ui-sans-serif, sans-serif"
    fontSize: "clamp(28px, 4.5vw, 50px)"
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: "-0.06em"
  title:
    fontFamily: "Space Grotesk, Inter, ui-sans-serif, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Inter, ui-sans-serif, -apple-system, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, ui-sans-serif, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    letterSpacing: "0.12em"
rounded:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "22px"
  xl: "32px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "22px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "#2F8CFF"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "13px 24px"
  button-primary-hover:
    backgroundColor: "#4A9FFF"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "11px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "9px 16px"
  input-default:
    backgroundColor: "rgba(255,255,255,0.80)"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  card-glass:
    backgroundColor: "rgba(255,255,255,0.68)"
    rounded: "{rounded.xl}"
    padding: "22px"
---

# Design System: InjuryGuide

## 1. Overview

**Creative North Star: "The Clinical Athenaeum"**

InjuryGuide occupies the precise midpoint between medical precision and athletic confidence. The interface is a well-lit consultation room, not a hospital ward — crisp white-frosted glass surfaces float over a cool misty-blue background, carrying information with authority and calm. Every element earns its opacity: surfaces that carry primary actions are more solid; contextual layers are more translucent, creating a natural depth hierarchy without artificial drama.

The aesthetic is purposefully light — a soft `#EEF6FF` canvas threaded with concentric cobalt rings, like the surface of still water. Against this, frosted-glass cards read as elevated, clinical documents. The cobalt blue (`#3B7DD8`) is the single voice of urgency and progress; it appears on CTAs, active states, and the anatomy selector — never decoratively. Motion is measured: spring-snapping, not bouncing; fading in, not flying in.

This system explicitly rejects two failure modes: it does not feel like an NHS hospital portal (sterile bureaucratic blue-on-white forms, zero personality) and it does not feel like a meditation app (soft pastels, organic blobs, slow ambient vibes). The design space is narrow and specific: a world-class physio's interface, clean enough to trust, confident enough to follow.

**Key Characteristics:**
- Light frosted-glass surfaces on a misty-blue canvas
- Single cobalt accent; all other colors are semantic (green = heal, amber = caution, red = stop)
- Space Grotesk headings with aggressive negative tracking; Inter body for legibility
- Spring physics for all interactive motion; no bouncing, no elastic
- Glass is structural, not decorative — applied only where hierarchy demands it

## 2. Colors: The Clinical Cobalt Palette

One primary accent, a deep blue-ink ramp, and a clean misty-blue canvas. Every other color is a semantic signal.

### Primary
- **Recovery Cobalt** (`#3B7DD8`): The single action color. Appears on primary buttons, active nav states, focus rings, progress indicators, and the anatomy selector fill. Used at ≤15% of any screen surface.
- **Deep Cobalt** (`#2D68C0`): Pressed/hover state for primary elements. Never used at rest.
- **Cobalt Mist** (`#EAF1FB`): The primary tint — used for selected chips, note backgrounds, and form hints.

### Secondary
- **Heal Green** (`#18A05A`): Recovery completion, criteria gates, positive assessments. Semantic only — never decorative.
- **Caution Amber** (`#E8A020`): Speed-phase indicators, warnings, moderate pain signals.
- **Stop Red** (`#D94F4F`): Pain indicators above threshold, error states, contraindication flags.
- **Periwinkle Blue** (`#5AABDE`): Informational accents — "protect" phase color, tooltips, secondary data.
- **Rehab Purple** (`#7C6FD4`): Capacity-phase color. Used exclusively in phase-tagging contexts.

### Neutral
- **Canvas** (`#EEF6FF`): Body background — cool blue-tinted white, the base of the misty-blue gradient.
- **Shallow Bg** (`#DCECFb`): Second surface tier for tinted panels and chart backgrounds.
- **Fog Bg** (`#C8E0F8`): Deepest background layer; used in the concentric rings and deep container tints.
- **Deep Ink** (`#0F1B2E`): Primary text. Never replaced with mid-gray for "elegance".
- **Mid Ink** (`#243550`): Secondary text, headings at lower hierarchy.
- **Slate Ink** (`#3D5878`): Tertiary text, supporting copy.
- **Muted Blue** (`#6080A0`): Placeholder text, disabled labels. Hits 4.5:1 on `#EEF6FF`.
- **Faint Blue** (`#90AACC`): Borders at rest, dividers, inactive icons.

### Named Rules
**The One Voice Rule.** Recovery Cobalt (`#3B7DD8`) is used on ≤15% of any screen. Its rarity is the point — when it appears, the user knows to act.

**The Semantic Color Rule.** Green means healed. Amber means cautious. Red means stop. Purple means capacity. These colors are never used decoratively. Violating this trains the user to ignore them.

## 3. Typography

**Display Font:** Space Grotesk (fallback: Inter, ui-sans-serif)
**Body Font:** Inter (fallback: ui-sans-serif, -apple-system)
**Mono Font:** ui-monospace, SF Mono, Fira Code

**Character:** Space Grotesk brings compressed, technical confidence to headings — the tight negative tracking reads as clinical precision, not stylistic affectation. Inter's humanist structure keeps body copy warm and legible at small sizes on mobile screens. The pairing avoids the sans-sans monoculture: Grotesk's geometric heaviness contrasts Inter's humanist flow.

### Hierarchy
- **Display** (800 weight, `clamp(28px, 4.5vw, 50px)`, line-height 0.96, -0.06em tracking): Section hero headings. One per page section maximum. `text-wrap: balance`.
- **Title** (700 weight, 22px, line-height 1.1, -0.04em tracking): Card headings, modal titles, section subheadings.
- **Headline** (700 weight, 17px, -0.03em tracking): Panel headings, named fields in assessment flow.
- **Body** (400 weight, 14px, line-height 1.6): All prose and UI copy. Max 65ch line length.
- **Label** (700 weight, 10px, 0.12em tracking, uppercase): Status pills, phase tags, nav labels, data unit labels. `text-transform: uppercase` always.
- **Micro** (600 weight, 12px): Secondary metadata, timestamps, helper text.

### Named Rules
**The Tight-Head Rule.** Display and Title headings carry negative letter-spacing (-0.04em to -0.06em). Any heading with tracking ≥ 0 reads as amateur on this system. The compression signals precision.

**The Legibility Floor Rule.** Body text is never lighter than `#6080A0` (`--muted`) on any canvas. Muted gray "for elegance" is the #1 reason clinical UIs become unreadable. If in doubt, go darker.

## 4. Elevation

This system uses **tonal glass layering** — depth is expressed through opacity, blur, and border-highlight rather than shadow alone. The background canvas is the ground plane; glass surfaces float above it with increasing opacity as hierarchy increases.

### Shadow Vocabulary
- **Lift XS** (`0 1px 4px rgba(40,90,180,0.10)`): Subtle separation for chips, badges, small interactive elements.
- **Lift SM** (`0 4px 20px rgba(40,90,180,0.13)`): Default card and panel elevation at rest.
- **Lift MD** (`0 12px 40px rgba(40,90,180,0.16)`): Hovered or focused card states; bottom nav bar.
- **Lift LG** (`0 24px 64px rgba(40,90,180,0.20)`): Modals, drawers, elevated dialogs.
- **Primary Glow** (`0 4px 28px rgba(59,125,216,0.38)`): Primary CTA buttons only. Not reused on cards.
- **Primary Glow LG** (`0 8px 40px rgba(59,125,216,0.30), 0 2px 12px rgba(59,125,216,0.18)`): Hovered primary button state.

### Glass Surface Vocabulary
- **Glass Low** (`rgba(255,255,255,0.42)`, `blur(20px) saturate(1.8)`): Background panels, inactive regions.
- **Glass Mid** (`rgba(255,255,255,0.60)`, `blur(20px) saturate(1.8)`): Default glass cards, form containers.
- **Glass High** (`rgba(255,255,255,0.82)`, `blur(20px) saturate(1.8)`): Top nav bar, active modal surfaces.
- **Glass Auth** (`rgba(255,255,255,0.68)`, `blur(20px) saturate(1.6)`): Auth/onboarding forms — slightly more opaque to improve legibility on the gradient canvas.

Every glass surface carries a **top specular edge**: a 1px linear gradient from transparent → `rgba(96,165,250,0.35)` → transparent along the top edge. This is the signature "liquid glass" detail.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Primary Glow shadow appears only on primary buttons, never on cards or panels. The system's elevation is expressed through glass opacity, not shadow weight.

**The Blur Budget Rule.** `backdrop-filter: blur(20px)` is the standard. Going above 28px is reserved for glass-card components that contain deep nested content. Going below 12px loses the frosted effect. Never omit `-webkit-backdrop-filter`.

## 5. Components

### Buttons
The button system is a hierarchy of conviction: primary = do the main thing; secondary = do a supporting thing; ghost = dismiss or navigate; text = secondary link.

- **Shape:** Pill radius (`999px`) for all buttons. There are no square or lightly-rounded buttons. The pill shape is the brand's signature tactile form.
- **Primary:** Cobalt-to-electric-blue linear gradient (`#2F8CFF → #1E6BFF`), white text (800 weight, 14px), `0 4px 28px rgba(59,125,216,0.38)` shadow. Hover lifts 2px with larger glow.
- **Secondary:** `rgba(255,255,255,0.68)` glass background, `#243550` text, `1.5px solid rgba(60,120,200,0.38)` border. Hover shifts background toward `#DCECFb`.
- **Ghost:** Transparent background, `#6080A0` text, `1.5px solid rgba(70,130,205,0.25)` border. Used for destructive-neutral or low-priority actions.
- **Text Button:** No background, no border. `#3B7DD8` color with a subtle text-shadow glow. Animated underline on hover. Used for "Create account" / "Forgot password" type affordances.

### Cards / Containers
Glass is purposeful: cards appear only where spatial separation helps the user understand hierarchy.

- **Corner Style:** Large gently-curved edges (`22px` — `--r-lg`). Auth form uses XL (`32px`). Never sharp corners.
- **Background:** `rgba(255,255,255,0.60)` frosted glass with `blur(20px) saturate(1.8)`.
- **Specular Highlight:** 1px top-edge gradient (`rgba(96,165,250,0.35)` at center) applied as `::before` pseudo-element.
- **Bottom Glow:** Diffuse cobalt radial gradient (`rgba(47,140,255,0.22)`) applied as `::after` pseudo-element, offset -50px below the card. Signature InjuryGuide depth detail.
- **Border:** `1px solid rgba(47,140,255,0.18)` at rest. Lighter on light-mode glass cards: `rgba(255,255,255,0.92)`.
- **Shadow:** Lift SM at rest; Lift MD on hover.
- **Internal Padding:** `22px` standard; `16px` on mobile.

### Inputs / Fields
- **Style:** Lightly rounded (`16px`), `rgba(255,255,255,0.80)` background, `1px solid rgba(180,210,250,0.50)` border at rest. Taller than generic defaults: `46px` height in auth contexts.
- **Focus:** Border shifts to `#3B7DD8`, `0 0 0 3px rgba(59,125,216,0.10)` focus ring. No color-only indicator — border weight also shifts.
- **Placeholder:** `#6080A0` — must maintain 4.5:1 contrast on the input background.
- **Error:** Border to `#D94F4F`, ring to `rgba(217,79,79,0.12)`.

### Navigation — Top (Desktop)
- **Style:** White frosted glass `rgba(255,255,255,0.72)`, `blur(20px) saturate(1.8)`, `1px solid rgba(160,195,245,0.30)` border. Sticky, `height: 56px`.
- **Brand:** "InjuryGuide" logotype in Space Grotesk 700 with a pulsing cobalt dot. The dot animates a soft 6px→16px box-shadow in `#3B7DD8` on a 2s loop.
- **Active link:** Cobalt primary color (`#3B7DD8`), 700 weight. Sliding pill indicator (`rgba(59,125,216,0.10)` background) tracks the active route.
- **Signed-in state:** Pulsing user dot in cobalt instead of "Sign in" link.

### Navigation — Bottom (Mobile)
InjuryGuide's signature mobile navigation: a 5-item pill bar that floats above the safe-area inset.

- **Container:** `rgba(235,242,255,0.72)` glass, `blur(24px) saturate(1.8)`, cobalt-tinted border, `12px` corner radius. Floats `10px` from viewport edges.
- **Active Pill:** Transparent glass pill (`rgba(255,255,255,0.22)`, `1px solid rgba(255,255,255,0.55)`, `border-radius: 9999px`) — driven by Framer Motion `useMotionValue` for zero-re-render 60fps drag.
- **Icons:** 23px SVG, stroke 1.65px at rest → 2.1px active. Active state: scale 1.12, y -1px (spring physics, stiffness 560, damping 28).
- **Labels:** 9px uppercase, 600 weight, 0.04em tracking. Opacity 0.38 at rest → 1.0 active.
- **Drag behavior:** Pointer capture → math-only slot hit test (O(1)) → spring snap on release (stiffness 520, damping 36, mass 0.55).

### Anatomy Body Map (Signature Component)
The interactive muscle/region selector is a core InjuryGuide primitive — not found in any standard component library.

- **SVG fills:** Premium cobalt blue `rgba(82,138,220,0.55)` at rest for selectable regions.
- **Selected state:** Solid `#2F6FD0` fill + `0 0 14px rgba(47,112,208,0.55)` glow filter. The selected region glows like a lit control panel indicator.
- **Hovered (unselected):** `rgba(59,125,216,0.42)` — intermediate between rest and selected.
- **Background figure:** Near-black `rgba(15,27,46,0.90)` for unselectable anatomy regions.

## 6. Do's and Don'ts

### Do:
- **Do** use Recovery Cobalt (`#3B7DD8`) as the single interactive accent — on buttons, active nav, focus rings, and the anatomy selector only.
- **Do** apply the top specular edge (`::before` gradient) to every glass card. It is the visual signature that makes the surface read as frosted glass, not a flat opaque panel.
- **Do** use Space Grotesk at 700–800 weight with negative tracking (≥ -0.04em) for all headings. Positive or zero tracking reads as amateurish on this system.
- **Do** use semantic colors for health signals: green = healed/complete, amber = caution, red = stop/contraindicated. These are clinical signals, not decorative choices.
- **Do** animate with spring physics (Framer Motion `useMotionValue` + `animate()`) — stiffness 400–560, damping 28–36. This is the only motion curve permitted for interactive feedback.
- **Do** ensure placeholder text uses `#6080A0` (`--muted`) or darker. It must hit 4.5:1 contrast on any input background.
- **Do** keep the bottom mobile nav pill's `touchAction: none` and use pointer capture for drag — prevents scroll conflicts and ensures 60fps behavior.
- **Do** add `@media (prefers-reduced-motion: reduce)` alternates for every animation — typically a 150ms crossfade in place of any spring or transform.

### Don't:
- **Don't** make the interface feel like a generic NHS / hospital portal — no sterile bureaucratic blue-on-white grids, no clinical-white backgrounds without glass texture, no form-heavy layouts with no visual hierarchy.
- **Don't** make the interface feel like a meditation or wellness app — no soft pastels, no organic blob shapes, no slow ambient gradients, no rounded sans at light weight.
- **Don't** use gradient text (`background-clip: text`). It is decoration without meaning. Use solid `#3B7DD8` or `#0F1B2E` for emphasis; use weight or size for hierarchy.
- **Don't** apply glass cards by default to every container. Glass is purposeful (PRODUCT.md Principle 4). Use plain backgrounds where spatial separation adds no value.
- **Don't** nest cards inside cards. A glass card inside a glass card is always wrong — collapse the hierarchy or use a `glass-card.inset` tint instead.
- **Don't** use the phase colors (green, amber, purple, red) outside their semantic phase-tagging context. Amber is not a "warm" accent; purple is not a "creative" highlight.
- **Don't** drop body text below `#6080A0` on any light surface. Muted gray for elegance is the single most common reason clinical UIs become unreadable.
- **Don't** use arbitrary z-index values (999, 9999). The semantic scale is: `10` content overlays → `20` dropdowns → `30` sticky nav → `40` modal backdrop → `50` modal → `60` toast → `70` tooltip.
- **Don't** animate layout CSS properties (width, height, top, left) for interactive feedback. Use `transform` and `opacity` only. The mobile nav uses `left` as a `useMotionValue` targeting a CSS `left` property — acceptable because it operates outside React's render cycle.
