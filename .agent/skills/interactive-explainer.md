# MaximusLabs Interactive Explainer Generator

## Description
Generates self-contained, brand-consistent interactive widgets for MaximusLabs AI. There are **two distinct widget categories**:

1. **Blog Interactive Explainers**: Summarize 5,000-8,000+ word articles into 60-second interactive experiences. White background with gradient header. Sits at the top of blog articles as an interactive TL;DR.
2. **Service Page Animations**: Visual, auto-playing animated widgets for service pages, landing pages, or hero sections. Full dark navy gradient theme. Decorative and atmospheric, not user-interactive.

Output is always a single HTML file ready to paste into a Webflow Custom Code Embed. Invoke with `/interactive-explainer`.

---

## STEP ZERO: Type Confirmation (MANDATORY)

**Before doing ANY work, always confirm with the user:**

> "Which type of explainer do you need?
> 1. **Blog Interactive Explainer** - an interactive TL;DR summary for a blog article (white background, tabs/steps, reader interacts with it)
> 2. **Service Page Animation** - a visual animated widget for a service or landing page (dark navy theme, auto-playing, decorative)

**If the user says "Service Page Animation":**
- Ask: "What is the **ideal max-width** and **min-height** for this widget? (Only you know where it will be embedded and what dimensions fit best.)"
- Do NOT proceed until you have both dimensions.
- Follow the **Service Page Animation** pipeline and design system below.

**If the user says "Blog Interactive Explainer":**
- Follow the existing blog explainer pipeline (max-width is always 780px).
- Ask for the article URL or content file.

---

# CATEGORY 1: Blog Interactive Explainers

## Purpose & Intent
MaximusLabs articles are exhaustive (5,000-8,000+ words). Readers need a way to:
- Quickly grasp the core concepts before committing to the full read
- Interact with key data points, frameworks, and processes visually
- See the "so what" upfront: why this matters, what the numbers show, how things work
- Navigate the most important information in an intuitive, visual manner

The explainer sits at the TOP of the article rich text, acting as an interactive summary/preview that hooks the reader.

## Inputs
When invoked for a blog explainer, ask the user for:

1. **Article URL**: The live URL of the published article (or a slug/path)
2. **Article content file** (optional): Path to the markdown/text file if not yet published
3. **Explainer type** (optional): If the user has a preference (see Explainer Types below)
4. **Specific data points** (optional): Any stats, metrics, or frameworks the user wants highlighted

If only a URL is provided, fetch and analyze the article content to determine the best explainer type automatically.

## Pipeline

### Step 1: Content Analysis
- Fetch/read the article content
- Extract: key thesis, core frameworks, important statistics, process flows, comparisons, terminology
- Identify the 4-5 most important concepts a reader MUST understand
- Determine the best explainer type based on content structure

### Step 2: Explainer Type Selection
Choose the most appropriate type (or combine types across tabs):

#### Type A: Tabbed Overview (Default)
Best for: Comprehensive guides, pillar content, multi-concept articles
- 3-5 tabs, each covering a major concept
- Mix of text definitions, visual comparisons, data bars, stat grids
- Example: The GEO Fundamentals explainer (What is GEO? | How AI Picks Sources | What Works | Why Now)

#### Type B: Visual Journey / Storytelling Flow
Best for: Process articles, buyer journeys, evolution pieces, "how X works" content
- Step-by-step visual progression (A -> B -> C -> D)
- Each step is clickable, revealing details
- Shows transformation: before state -> process -> after state
- Connecting lines/arrows between steps
- Example: "How a prospect moves from Problem Aware -> Solution Aware -> Product Aware -> Decision"

#### Type C: Data Dashboard
Best for: Data-heavy articles, benchmark reports, comparison pieces
- Stat cards with big numbers
- Animated bar/progress charts
- Before/after comparisons
- Conversion funnels
- Example: "GEO Metrics That Matter" with live-looking stat cards

#### Type D: Interactive Comparison
Best for: "X vs Y" articles, migration guides, before/after analyses
- Side-by-side panels with toggle
- Highlight differences with color coding
- Shared criteria rows
- Example: "GEO vs SEO" with switchable views

#### Type E: Concept Map / Framework
Best for: Strategy articles, taxonomy content, pillar pages with many subtopics
- Central concept with radiating branches
- Click each branch to expand details
- Shows relationships between concepts
- Example: "The 7 Pillars of GEO" with a central hub and clickable spokes

### Step 3: Build the Explainer
Generate the HTML/CSS/JS following ALL rules in the Blog Design System section below.

### Step 4: Save & Preview
- Save to `geo-explainer/[article-slug]-explainer.html`
- If a preview server is available, start/use it and show all interactive states
- Verify all tabs/steps work, animations fire, responsive layout holds

### Step 5: Provide Embed Instructions
Tell the user:
1. Open Webflow Designer > CMS Items > [Collection] > [Article]
2. In the rich text field, click at the very top
3. Add a Custom Code Embed (+ > Embed, or Cmd+Shift+K)
4. Paste the full contents of the HTML file
5. Save & Close

---

## Blog Design System (MANDATORY for Category 1)

Read the design tokens from `geo-explainer/design-tokens.md` before generating any explainer. These tokens are the locked-in MaximusLabs brand system and MUST be followed exactly.

### Core Rules

**Font**: `Satoshi, -apple-system, BlinkMacSystemFont, sans-serif`

**Color palette** (use ONLY these):
- Deep navy `#001c64` - headings, stat numbers, strong emphasis
- Dark blue `#1e3251` - active step numbers, "vs" badges, button-like elements
- Medium blue `#003087` - links, bar labels, highlight text
- Heading blue `#0070e0` - active tab indicator, accent borders, primary accent
- Light blue `#449afb` - badges, tags, light accents
- Grey `#f3f3f6` - backgrounds (tabs, cards, tracks, footer)
- Body text `#333` - primary text
- Secondary text `#555` - descriptions
- Border `#e2e2e2` - dividers, card borders
- Negative `#c0392b` - decline values only
- Header gradient: `linear-gradient(192deg, #001435 30%, #003087)`

**Sizing**: Use `rem` units. Body `1rem`, small `.875rem`, tiny `.75rem`.

**Radius**: `.5rem` for cards, `.25rem` for small elements.

**Transitions**: `cubic-bezier(.77,0,.175,1)` for interactions, `0.3s ease` for fades.

### CSS Scoping (NON-NEGOTIABLE)

Every blog explainer MUST follow these isolation rules to prevent breaking the host page:

1. **Unique root ID**: Each explainer gets a unique ID: `#ml-ix-[slug]` (e.g., `#ml-ix-geo-fundamentals`)
2. **Prefixed classes**: ALL classes prefixed with `ml-ix-` (MaximusLabs Interactive eXplainer)
3. **All selectors scoped**: Every CSS rule starts with `#ml-ix-[slug]` for double specificity
4. **Scoped reset**: `box-sizing`, `margin`, `padding` reset ONLY inside the root container
5. **No tag selectors**: NEVER target bare `p`, `div`, `h2`, `ul`, `li`, etc.
6. **IIFE wrapper**: ALL JavaScript wrapped in `(function(){ var root = document.getElementById('ml-ix-[slug]'); if(!root) return; ... })()`
7. **Zero globals**: No global variables, no `window.` assignments
8. **Max-width**: `780px` with `margin: 0 auto` (fits inside blog content column)
9. **Charset**: `<meta charset="UTF-8">` before the root div

### Structure Template

Every blog explainer follows this HTML skeleton:

```html
<meta charset="UTF-8">
<div id="ml-ix-[slug]">
<style>
/* Scoped reset */
#ml-ix-[slug] *, #ml-ix-[slug] *::before, #ml-ix-[slug] *::after { box-sizing: border-box; margin: 0; padding: 0; }
#ml-ix-[slug] { font-family: Satoshi, -apple-system, BlinkMacSystemFont, sans-serif; max-width: 780px; margin: 0 auto 2rem auto; border-radius: .5rem; overflow: hidden; border: 1px solid #1e325120; background: #fff; color: #333; line-height: 1.5; font-size: 1rem; position: relative; }

/* Header - ALWAYS this gradient */
#ml-ix-[slug] .ml-ix-header { background: linear-gradient(192deg, #001435 30%, #003087); padding: 24px 24px 18px; color: #fff; }
#ml-ix-[slug] .ml-ix-badge { display: inline-block; font-size: .75rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; background: #449afb; padding: .3rem .75rem; border-radius: .5rem; margin-bottom: 10px; color: #fff; }
#ml-ix-[slug] .ml-ix-title { font-size: 1.375rem; font-weight: 700; margin-bottom: 4px; line-height: 1.2; color: #fff; }
#ml-ix-[slug] .ml-ix-subtitle { font-size: .875rem; opacity: 0.8; font-weight: 400; }

/* ... content-specific styles ... */

/* Footer - ALWAYS this pattern */
#ml-ix-[slug] .ml-ix-footer { padding: 12px 24px; background: #f3f3f6; border-top: 1px solid #e2e2e2; font-size: .6875rem; color: #1e325180; text-align: center; }
#ml-ix-[slug] .ml-ix-footer a { color: #003087; text-decoration: none; font-weight: 500; }
#ml-ix-[slug] .ml-ix-footer a:hover { text-decoration: underline; }

/* Responsive */
@media (max-width: 600px) { /* mobile overrides */ }
</style>

<!-- HEADER -->
<div class="ml-ix-header">
  <div class="ml-ix-badge">Interactive Guide</div>
  <div class="ml-ix-title">[Title] in 60 Seconds</div>
  <div class="ml-ix-subtitle">[Interaction hint for the user]</div>
</div>

<!-- CONTENT (type-specific) -->
...

<!-- FOOTER -->
<div class="ml-ix-footer">
  MaximusLabs AI &middot; <a href="[article-url]" target="_blank" rel="noopener">Read the full guide</a>
</div>

<script>
(function() {
  var root = document.getElementById('ml-ix-[slug]');
  if (!root) return;
  // ... interaction logic ...
})();
</script>
</div>
```

### Content Guidelines

- **Badge text**: "Interactive Guide" (default), or "Visual Journey", "Data Snapshot", "Quick Compare" based on type
- **Title**: "[Topic] in 60 Seconds" or "[Topic] at a Glance"
- **Subtitle**: Action hint - "Click each tab to explore...", "Follow the journey from...", "Toggle to compare..."
- **Footer**: Always `MaximusLabs AI` with link to the full article
- **No em/en dashes**: Use commas, periods, colons, or rewrite sentences
- **No external dependencies**: Zero CDN calls, zero library imports
- **Bundle target**: 15-30 KB raw, under 8 KB gzipped

### Visual Storytelling Components (Blog Context)

When building journey/flow visualizations, use these patterns:

**Step indicators**: Numbered circles (inactive: `#f3f3f6` bg, `#1e3251` text; active: `#1e3251` bg, `#fff` text)

**Connecting lines**: `2px` wide, `#e2e2e2` color, vertical between steps

**Progress feeling**: Active steps scale up slightly (`transform: scale(1.1)`) with the site's cubic-bezier easing

**Stat cards**: `#f3f3f6` background, `#001c64` big number, `.5rem` radius, `1px solid #e2e2e2` border

**Bar charts**: Track `#f3f3f6`, fills use the navy-to-blue gradient spectrum:
- Top tier: `linear-gradient(90deg, #001c64, #003087)`
- Strong: `linear-gradient(90deg, #003087, #0070e0)`
- Moderate: `linear-gradient(90deg, #0070e0, #449afb)`
- Limited: `linear-gradient(90deg, #449afb, #449afb99)`
- Negative: `linear-gradient(90deg, #c0392b, #e74c3c)`

**Callout/takeaway blocks**: `#3d4d740f` background, `3px solid #0070e0` left border, `.5rem` radius on right side

**Comparison cards**: Side-by-side grid. "Old/before" gets `#f3f3f6` bg + `#e2e2e2` border (muted). "New/after" gets `#edf5ff` bg + `#449afb40` border (highlighted).

---

# CATEGORY 2: Service Page Animations

## Purpose & Intent
Service pages and landing pages need visual, atmospheric widgets that:
- Communicate a concept visually without requiring user interaction
- Auto-play through animation sequences on a loop
- Feel premium, techy, and on-brand
- Act as hero visuals or section accents alongside copy

These are NOT interactive summaries. They are decorative animated illustrations that reinforce the service narrative.

## Inputs
When invoked for a service page animation, ask the user for:

1. **Concept/service**: What the animation should visualize (e.g., "AI Visibility Engine", "Content Pipeline", "Platform coverage")
2. **Max-width and min-height**: The user MUST provide target dimensions. Different service pages have different embed contexts; only the user knows the right size.
3. **Content details** (optional): Specific platform names, metrics, stage labels, or data to display
4. **Animation style** (optional): Hub-and-spoke, stage cycling, data visualization, or let the builder choose

## Pipeline

### Step 1: Concept Design
- Understand what the service does and what visual metaphor best represents it
- Choose an animation pattern (see Animation Patterns below)
- Plan the elements: icons, labels, metrics, stages, connections

### Step 2: Build the Animation
Generate the HTML/CSS/JS following ALL rules in the Service Page Design System below.

### Step 3: Save & Preview
- Save to `[service-folder]/[widget-name].html` and a matching `index.html` preview wrapper
- Start preview server and verify full animation cycle
- Confirm all elements fit within the user-specified dimensions
- Check responsive behavior at mobile breakpoint

### Step 4: Provide Embed Instructions
Tell the user:
1. Open Webflow Designer, navigate to the target page
2. Add a Custom Code Embed where the widget should appear
3. Paste the full contents of the production HTML file
4. Adjust the parent container in Webflow as needed

---

## Service Page Design System (MANDATORY for Category 2)

### The Premium Dark Theme

Service page animations use a full dark navy gradient theme. This is the signature MaximusLabs "premium tech" aesthetic.

**Root background gradient**:
```css
background: linear-gradient(170deg, #001028 0%, #001c64 45%, #002d7a 100%);
```

**Premium box shadow** (multi-layer depth):
```css
box-shadow:
  0 25px 80px rgba(0, 16, 40, 0.5),
  0 0 0 1px rgba(68, 154, 251, 0.12),
  inset 0 1px 0 rgba(255, 255, 255, 0.06);
```

**Border radius**: `16px` for the widget root (larger than blog explainers for a softer, more premium feel)

**Dot-grid texture overlay** (creates depth):
```css
background-image: radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px);
background-size: 20px 20px;
```
Apply via a `::before` pseudo-element or a dedicated `.bg` div, positioned absolute with `inset: 0`, `pointer-events: none`.

**Top shine line** (subtle premium edge highlight):
```css
/* via ::after on root */
position: absolute;
top: 0; left: 12%; right: 12%;
height: 1px;
background: linear-gradient(90deg, transparent, rgba(68,154,251,0.3), transparent);
```

**Radial glow** (optional, adds focus to center):
```css
background: radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0, 112, 224, 0.1) 0%, transparent 70%);
```

### Color Palette (Dark Context)

All colors sit on the dark gradient background. Text uses white at varying opacities.

| Element | Color | Notes |
|---------|-------|-------|
| Headings | `rgba(255,255,255,0.92)` to `rgba(255,255,255,0.95)` | Near-white |
| Body text | `rgba(255,255,255,0.7)` | Readable but not harsh |
| Labels (uppercase) | `rgba(255,255,255,0.4)` | Subtle, structural |
| Muted/inactive | `rgba(255,255,255,0.2)` | Ghost text |
| Primary accent | `#449afb` | Badges, metric values, active labels |
| Active glow source | `#0070e0` | Active state backgrounds, glow halos |
| Success/live | `#34d399` | "Live" indicators, high-value items |
| Purple accent | `#c084fc` / `rgba(168,85,247,...)` | Variety/category color |
| Amber accent | `#fbbf24` | Variety/category color |

### Glass-morphism Cards (Dark Context)

Cards on dark backgrounds use frosted glass appearance:
```css
background: rgba(255,255,255,0.035);
border: 1px solid rgba(255,255,255,0.06);
border-radius: 10px;
```

On hover or active state, increase border opacity:
```css
border-color: rgba(255,255,255,0.12);
box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
```

### Typography (Dark Context)

Same Satoshi font family. Sizes adjusted for service page viewing distance:

| Element | Size | Weight |
|---------|------|--------|
| Widget title | `1rem` to `1.125rem` | 700 |
| Stage/section label | `.5625rem` | 700, uppercase, letter-spacing 1-1.5px |
| Body text in cards | `.8125rem` | 500 |
| Metric numbers | `.6875rem` | 700 |
| Tiny labels | `.5rem` to `.5625rem` | 700, uppercase |

Labels use `#449afb` color with uppercase + extra letter-spacing for a structural, technical feel.

### Animation Patterns

#### Pattern 1: Hub-and-Spoke
Central element (logo/icon) with satellite nodes positioned absolutely around it. SVG lines connect nodes to hub.

Key details:
- Hub: Circular with conic-gradient spinning ring (`conic-gradient(from 0deg, #0070e0, #449afb, #003087, #0070e0)`)
- Hub inner: `background: linear-gradient(145deg, #001c64, #002d7a)` with subtle border
- Nodes: Icon (white bg, rounded), name label (uppercase, muted), metric badge (accent color, pill shape)
- SVG connection lines: `stroke: rgba(68,154,251,0.35)`, `stroke-width: 1.5`, animated with `stroke-dashoffset`
- Line glow: Second SVG line underneath with `stroke-width: 8` and `opacity: 0.1` for depth
- Nodes positioned with `top: %` and `left: %`, centered with `transform: translate(-50%, -50%)`
- Node reveal: Start at `opacity: 0; scale(0.6)`, animate to `opacity: 1; scale(1)` with spring cubic-bezier
- Hover: `scale(1.12)` with glow box-shadow

Reference: `service-page-hero/ai-visibility-engine.html`

#### Pattern 2: Stage Cycling
Linear progression through 3-5 stages, auto-advancing on a timer.

Key details:
- Dot navigation: Row of numbered circles (26px) connected by thin lines (1.5px)
- Active dot: `background: #0070e0`, `box-shadow: 0 0 14px rgba(0,112,224,0.3)`, `scale(1.12)`
- Done dot: `background: rgba(52,211,153,0.1)`, `border-color: rgba(52,211,153,0.2)`, `color: #34d399`
- Connector line fill: `linear-gradient(90deg, #0070e0, #449afb)`, animated width 0 to 100%
- Content panels: One visible at a time, others `display: none`, fade-in via `translateY(6px)` + `opacity` animation
- Each stage has: tiny label (uppercase accent), title (white, bold), and stage-specific visual content
- Stage content types: keyword rows with mini bars, document mockups with schema tags, metric grids, data visualization
- Auto-cycle interval: 3-5 seconds per stage, loops continuously
- "Live" indicator: Pulsing green dot + uppercase label in header

Reference: `services-explainer/ai-engine-animation.html`

#### Pattern 3: Data Visualization
Animated charts, metrics, and progress indicators.

Key details:
- Score displays: Large centered number with animated count-up
- Progress bars: Track `rgba(255,255,255,0.06)`, fill with gradient, animated width
- Metric badges: Pill shapes with accent border + background tint
- Platform icons: White background squares with rounded corners, platform logos inside
- Staggered reveal: Each element appears sequentially with `index * delay` timing

### Animation Timing

| Animation | Duration | Easing | Notes |
|-----------|----------|--------|-------|
| Element reveal | 0.4-0.5s | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Spring overshoot for pop-in |
| Slide-in | 0.4s | `cubic-bezier(.77,0,.175,1)` | Standard site easing |
| Fade | 0.3-0.35s | `ease` | Simple opacity transitions |
| Bar fill | 0.5-0.8s | `cubic-bezier(0.22, 1, 0.36, 1)` | Smooth deceleration |
| SVG line draw | 0.8s | `cubic-bezier(0.22, 1, 0.36, 1)` | stroke-dashoffset animation |
| Hub ring spin | 6s | `linear` | Continuous rotation, infinite |
| Cursor blink | 0.85s | `ease-in-out` | Opacity 1 to 0, infinite |
| Pulse (live dot) | 2s | `ease-in-out` | Opacity + box-shadow, infinite |
| Stagger delay | 80-150ms | per item | `index * delay` for sequential reveals |

### CSS Scoping (Service Page)

Same non-negotiable isolation rules as blog explainers, with different prefix:

1. **Unique root ID**: `#ml-sp-[slug]` (e.g., `#ml-sp-content-engine`) or `#ml-ix-vis-[slug]`
2. **Prefixed classes**: `ml-sp-` (MaximusLabs Service Page) or `ml-ix-vis-` (Visibility widget variant)
3. **All selectors scoped**: Every CSS rule starts with root ID
4. **Scoped reset**: Inside root container only
5. **No tag selectors**: NEVER target bare tags
6. **IIFE wrapper**: ALL JavaScript in `(function(){ var root = document.getElementById('[root-id]'); if(!root) return; ... })()`
7. **Zero globals**: No global variables
8. **Dimensions**: Use the max-width and min-height provided by the user
9. **Charset**: `<meta charset="UTF-8">` before root div
10. **`aria-hidden="true"`**: Service page animations are decorative; add to root div

### Structure Template (Service Page)

```html
<meta charset="UTF-8">
<div id="ml-sp-[slug]" aria-hidden="true">
<style>
/* Scoped reset */
#ml-sp-[slug] *, #ml-sp-[slug] *::before, #ml-sp-[slug] *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* Root: user-specified dimensions */
#ml-sp-[slug] {
  font-family: Satoshi, -apple-system, BlinkMacSystemFont, sans-serif;
  width: 100%;
  max-width: [USER_MAX_WIDTH];
  min-width: 0;
  min-height: [USER_MIN_HEIGHT];
  margin: 0 auto;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(170deg, #001028 0%, #001c64 45%, #002d7a 100%);
  box-shadow: 0 25px 80px rgba(0, 16, 40, 0.5), 0 0 0 1px rgba(68, 154, 251, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  color: #fff;
  line-height: 1.5;
  font-size: 1rem;
}

/* Dot grid background */
#ml-sp-[slug]::before {
  content: '';
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none; z-index: 0;
}

/* Top shine line */
#ml-sp-[slug]::after {
  content: '';
  position: absolute;
  top: 0; left: 12%; right: 12%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(68,154,251,0.3), transparent);
  z-index: 2;
}

/* Ensure content sits above pseudo-elements */
#ml-sp-[slug] > * { position: relative; z-index: 1; }

/* ... animation-specific styles ... */

/* Responsive */
@media (max-width: 480px) { /* mobile overrides: scale icons, fonts, padding */ }
</style>

<!-- CONTENT (animation-specific) -->
...

<script>
(function() {
  var root = document.getElementById('ml-sp-[slug]');
  if (!root) return;
  // ... animation logic ...
})();
</script>
</div>
```

---

# SHARED RULES (Both Categories)

### Quality Checklist (verify before delivering)

**Common (both types):**
- [ ] Root ID is unique
- [ ] ALL classes use the correct prefix (`ml-ix-` for blog, `ml-sp-` for service page)
- [ ] ALL CSS selectors scoped under root ID
- [ ] JS wrapped in IIFE with null-check on root
- [ ] Zero tag-level CSS selectors
- [ ] No em/en dashes anywhere in content
- [ ] No external dependencies (zero CDN, zero libraries)
- [ ] Font is Satoshi (inherits from site, declared as fallback)
- [ ] All colors from the approved palette only
- [ ] Responsive breakpoint exists (600px for blog, 480px for service page)
- [ ] Bundle under 30 KB raw
- [ ] `<meta charset="UTF-8">` present before root div

**Blog explainer extras:**
- [ ] Header uses exact gradient: `linear-gradient(192deg, #001435 30%, #003087)`
- [ ] Footer says "MaximusLabs AI" with article link
- [ ] Max-width is 780px
- [ ] All interactive states work (tabs switch, steps expand, bars animate)

**Service page animation extras:**
- [ ] Root uses dark gradient: `linear-gradient(170deg, #001028, #001c64, #002d7a)`
- [ ] Dot-grid texture overlay present
- [ ] Top shine line present
- [ ] Premium box-shadow (3-layer) present
- [ ] `aria-hidden="true"` on root div
- [ ] Dimensions match what user specified
- [ ] Full animation cycle plays and loops correctly
- [ ] All staggered reveals fire in sequence

---

## Reference Implementations

**Blog Interactive Explainer (Type A: Tabbed Overview):**
See `geo-explainer/geo-interactive-explainer.html` for the canonical implementation. This is the gold standard for blog explainer visual consistency.

**Service Page Animation (Hub-and-Spoke):**
See `service-page-hero/ai-visibility-engine.html` for the canonical dark-theme hub-and-spoke implementation with platform nodes, SVG connections, typing search bar, and animated score reveal.

**Service Page Animation (Stage Cycling):**
See `services-explainer/ai-engine-animation.html` for the canonical dark-theme stage cycling implementation with dot navigation, auto-advancing content panels, and "live" indicator.

**Design Tokens:**
See `geo-explainer/design-tokens.md` for the complete color, typography, spacing, and effects reference (primarily scoped to blog explainers; service page tokens are documented inline above).
