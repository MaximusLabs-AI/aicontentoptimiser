# MaximusLabs AI - Interactive Explainer Design Tokens
## Locked-in: 2026-03-02

These tokens are extracted from the live maximuslabs.ai Webflow CSS and must be used consistently across all interactive explainers.

## Colors

| Token | Hex | Usage |
|-------|-----|-------|
| --blue (deep navy) | `#001c64` | Headings, stat numbers, strong emphasis |
| --dark-blue | `#1e3251` | Button backgrounds, header gradient end, step numbers (active), "vs" badges, body text (secondary) |
| --medium-blue | `#003087` | Links in rich text, bar chart labels, highlight text, header gradient |
| --heading-blue | `#0070e0` | Active tab indicator, accent borders, callout left-border, primary accent |
| --light-blue | `#449afb` | Badges, tag backgrounds, light accents, hover tints |
| --light-blue-50 | `#449afb80` | Tab hover bg, subtle borders |
| --grey | `#f3f3f6` | Page background, tab bar bg, stat cards bg, bar chart tracks, footer bg |
| --black | `#101011` | Rare, only for deepest text |
| --white | `#ffffff` | Card backgrounds, panel backgrounds |
| Body text | `#333` | Primary body text color |
| Secondary text | `#555` | Descriptions, labels, secondary content |
| Muted text | `#666` | Tertiary text, small labels |
| Muted text (lighter) | `#1e325180` | Footer text, faded numbers |
| Border | `#e2e2e2` | Card borders, dividers, tab bar bottom border |
| FAQ/callout bg | `#3d4d740f` | Subtle background for callout/takeaway blocks |
| Negative/error | `#c0392b` | Negative values, decline indicators |
| Header gradient | `linear-gradient(192deg, #001435 30%, #003087)` | Widget header background |

## Typography

Note: Blog body text uses `font-size: 15px` (from `.rich-text-block`). Widget sizes are scaled up by one step so readable content matches or exceeds the surrounding blog text.

| Element | Value | Notes |
|---------|-------|-------|
| Font family | `Satoshi, -apple-system, BlinkMacSystemFont, sans-serif` | |
| Widget base | `1rem` (16px) | Slightly above blog's 15px |
| Body line-height | `1.5` | |
| Definition/intro text | `1.0625rem` (17px) | Primary paragraph content |
| Content text (tabs, descriptions, lists) | `.9375rem` (15px) | Matches blog body exactly |
| Data labels (bar labels, values) | `.875rem` (14px) | |
| Small labels (badges, card labels, stat labels) | `.8125rem` (13px) | |
| Tiny text (footer, conversion labels) | `.75rem` (12px) | |
| Widget title (H2-level) | `1.5rem` (24px) | |
| Stat numbers | `2rem` (32px) | |
| Conversion numbers | `1.625rem` (26px) | |
| Font weight regular | `400` | |
| Font weight medium | `500` | |
| Font weight bold | `700` | |

## Spacing & Radius

| Token | Value |
|-------|-------|
| Card border-radius | `.5rem` |
| Small radius | `.25rem` (bar fills, small elements) |
| Pill/badge radius | `.5rem` |
| Widget outer radius | `.5rem` |
| Panel padding | `24px` |
| Header padding | `24px 24px 18px` |
| Tab padding | `12px 18px` |
| Card padding | `18px` |
| Stat card padding | `18px 12px` |
| Grid gap | `14px` |

## Effects

| Token | Value |
|-------|-------|
| Border style | `1px solid #1e325120` (widget outer) |
| Card border | `1px solid #e2e2e2` |
| Transition easing | `cubic-bezier(.77,0,.175,1)` (site's standard curve) |
| Fade-in animation | `0.3s ease, translateY(6px)` |
| Bar animation | `0.8s cubic-bezier(0.22, 1, 0.36, 1)` |

## CSS Scoping Rules

- ALL class names MUST be prefixed with `geo-ix-` (or article-specific prefix)
- ALL CSS selectors MUST be scoped under a unique root ID (e.g., `#geo-ix-root`)
- NO tag-level selectors (never target bare `p`, `div`, `h2`, etc.)
- Scoped reset (`box-sizing`, `margin`, `padding`) ONLY inside root container
- JS wrapped in IIFE: `(function(){ ... })()`
- Zero global variables from JS
- `max-width: 780px` with `margin: 0 auto` to fit inside blog content column
- Use `<meta charset="UTF-8">` before the root div

## Responsive Breakpoints

| Breakpoint | Adjustments |
|------------|-------------|
| max-width: 600px | Reduce font sizes, stack grids, smaller padding |

## Footer Pattern

```html
<div class="[prefix]-footer">
  MaximusLabs AI &middot; <a href="[article-url]" target="_blank" rel="noopener">Read the full guide</a>
</div>
```
