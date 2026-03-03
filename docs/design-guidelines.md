# per-cc Design Guidelines

> Personal Command Center — Mobile-first dark productivity dashboard
> Stack: Next.js 14 + Tailwind CSS | Primary target: phone browser (430px viewport)

---

## 1. Design Philosophy

**Command Center Aesthetic** — Inspired by mission-critical ops dashboards, terminal UIs, and high-end trading platforms. Dense but readable. Every pixel earns its place. No decorative fluff.

Core traits:
- Data-dense but scannable — grouping + whitespace rhythm
- Dark-first: designed for OLED screens, true blacks save battery
- Monochrome base + single accent for focus
- Micro-feedback on every interaction (tap ripple, status pulse)
- Vietnamese + English content coexist without layout tension

---

## 2. Color Palette

### Dark Mode (default)

| Token | Tailwind class | Hex | Usage |
|---|---|---|---|
| `bg-base` | `bg-[#080C10]` | `#080C10` | Page background (true OLED black) |
| `bg-surface` | `bg-[#0F1419]` | `#0F1419` | Card/panel surface |
| `bg-surface-2` | `bg-[#161D26]` | `#161D26` | Elevated card, input bg |
| `bg-surface-3` | `bg-[#1C2533]` | `#1C2533` | Hover state, selected row |
| `border-subtle` | `border-[#1F2D3D]` | `#1F2D3D` | Dividers, card borders |
| `border-muted` | `border-[#2A3A4D]` | `#2A3A4D` | Input borders |
| `text-primary` | `text-[#E8EDF2]` | `#E8EDF2` | Primary text |
| `text-secondary` | `text-[#8B9BB0]` | `#8B9BB0` | Labels, metadata |
| `text-muted` | `text-[#4A5A6E]` | `#4A5A6E` | Placeholders, disabled |
| `accent` | `text-[#3DD6F5]` | `#3DD6F5` | Primary accent — electric cyan |
| `accent-dim` | `bg-[#3DD6F5]/10` | — | Accent tint bg |
| `success` | `text-[#22D47A]` | `#22D47A` | Online, profit, pass |
| `success-dim` | `bg-[#22D47A]/10` | — | Success tint bg |
| `danger` | `text-[#F5564A]` | `#F5564A` | Down, loss, error |
| `danger-dim` | `bg-[#F5564A]/10` | — | Danger tint bg |
| `warning` | `text-[#F5A623]` | `#F5A623` | Alert, expiring, caution |
| `warning-dim` | `bg-[#F5A623]/10` | — | Warning tint bg |
| `purple` | `text-[#A78BFA]` | `#A78BFA` | AI labels, learning module |
| `purple-dim` | `bg-[#A78BFA]/10` | — | AI tint bg |

### Light Mode (toggle)

| Token | Hex | Usage |
|---|---|---|
| `bg-base` | `#F0F4F8` | Page background |
| `bg-surface` | `#FFFFFF` | Card surface |
| `bg-surface-2` | `#F7FAFC` | Elevated, input |
| `border-subtle` | `#DDE3EA` | Dividers |
| `text-primary` | `#0F1419` | Primary text |
| `text-secondary` | `#4A5A6E` | Labels |
| `accent` | `#0099B8` | Accent (darker for contrast) |

**Implementation:** Add `class="dark"` to `<html>`. Use Tailwind `dark:` variants throughout.

---

## 3. Typography

### Font Stack

**Primary (UI Text):** `Space Grotesk` — geometric, techy, excellent for dashboards. Supports Vietnamese.
**Monospace (data, codes, counts):** `JetBrains Mono` — the developer/trader font. Zero-ambiguity numerals.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

**CSS variables:**
```css
--font-ui: 'Space Grotesk', system-ui, sans-serif;
--font-data: 'JetBrains Mono', 'Fira Code', monospace;
```

**Tailwind config extension:**
```js
fontFamily: {
  ui: ['Space Grotesk', 'system-ui', 'sans-serif'],
  data: ['JetBrains Mono', 'Fira Code', 'monospace'],
}
```

### Type Scale

| Role | Size | Weight | Font | Tailwind |
|---|---|---|---|---|
| Module title | 18px | 600 | Space Grotesk | `text-lg font-semibold font-ui` |
| Section header | 13px | 600 | Space Grotesk | `text-[13px] font-semibold uppercase tracking-widest font-ui` |
| Body | 14px | 400 | Space Grotesk | `text-sm font-ui` |
| Body strong | 14px | 500 | Space Grotesk | `text-sm font-medium font-ui` |
| Caption | 12px | 400 | Space Grotesk | `text-xs font-ui` |
| Data number large | 24px | 600 | JetBrains Mono | `text-2xl font-semibold font-data` |
| Data number medium | 16px | 500 | JetBrains Mono | `text-base font-medium font-data` |
| Data number small | 12px | 400 | JetBrains Mono | `text-xs font-data` |
| Ticker/code | 11px | 500 | JetBrains Mono | `text-[11px] font-medium font-data` |

**Line heights:** Body → `leading-relaxed` (1.6). Data → `leading-none`. Headings → `leading-snug`.

---

## 4. Spacing System

Tailwind 4px base grid. Key values:

| Token | px | Tailwind |
|---|---|---|
| xs | 4px | `p-1 / gap-1` |
| sm | 8px | `p-2 / gap-2` |
| md | 12px | `p-3 / gap-3` |
| base | 16px | `p-4 / gap-4` |
| lg | 20px | `p-5 / gap-5` |
| xl | 24px | `p-6 / gap-6` |
| 2xl | 32px | `p-8 / gap-8` |

**Mobile padding rule:** Horizontal page padding = `px-4` (16px). Never less than 12px on mobile.

**Bottom nav clearance:** Always add `pb-20` (80px) to main content so content is not hidden behind bottom nav.

---

## 5. Component Patterns

### 5.1 Card

```html
<!-- Standard card -->
<div class="bg-[#0F1419] border border-[#1F2D3D] rounded-2xl p-4">
  <!-- content -->
</div>

<!-- Elevated card (for primary info) -->
<div class="bg-[#161D26] border border-[#2A3A4D] rounded-2xl p-4">
  <!-- content -->
</div>

<!-- Clickable card -->
<div class="bg-[#0F1419] border border-[#1F2D3D] rounded-2xl p-4
            active:bg-[#1C2533] transition-colors duration-150 cursor-pointer">
  <!-- content -->
</div>
```

**Rules:**
- Border radius: `rounded-2xl` (16px) for cards, `rounded-xl` (12px) for smaller components
- Never use box-shadow on dark backgrounds — it doesn't look right on OLED. Use border instead.
- Card gap in lists: `gap-3` (12px)

### 5.2 Badge

```html
<!-- Status badge -->
<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium">

<!-- Accent badge -->
<span class="bg-[#3DD6F5]/10 text-[#3DD6F5] inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium">

<!-- Success badge -->
<span class="bg-[#22D47A]/10 text-[#22D47A] inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium">

<!-- Danger badge -->
<span class="bg-[#F5564A]/10 text-[#F5564A] inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium">

<!-- Warning badge -->
<span class="bg-[#F5A623]/10 text-[#F5A623] inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium">

<!-- AI/purple badge -->
<span class="bg-[#A78BFA]/10 text-[#A78BFA] inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium">
```

### 5.3 Status Dot

```html
<!-- Online / success — with pulse animation -->
<span class="relative flex h-2 w-2">
  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22D47A] opacity-40"></span>
  <span class="relative inline-flex rounded-full h-2 w-2 bg-[#22D47A]"></span>
</span>

<!-- Down / danger — static, no pulse -->
<span class="inline-flex rounded-full h-2 w-2 bg-[#F5564A]"></span>

<!-- Warning — slow pulse -->
<span class="relative flex h-2 w-2">
  <span class="animate-pulse absolute inline-flex h-full w-full rounded-full bg-[#F5A623] opacity-60"></span>
  <span class="relative inline-flex rounded-full h-2 w-2 bg-[#F5A623]"></span>
</span>
```

### 5.4 Module Header

```html
<div class="flex items-center justify-between mb-4">
  <div class="flex items-center gap-2">
    <!-- Icon slot (16px SVG or emoji) -->
    <span class="text-base">⚡</span>
    <h2 class="text-lg font-semibold text-[#E8EDF2] font-ui">Module Name</h2>
  </div>
  <!-- Optional action -->
  <button class="text-xs text-[#3DD6F5] font-medium font-ui">See all</button>
</div>
```

### 5.5 Section Label (above grouped items)

```html
<p class="text-[11px] font-semibold uppercase tracking-widest text-[#4A5A6E] mb-2 font-ui">
  Section Label
</p>
```

### 5.6 Input / Textarea

```html
<input
  type="text"
  placeholder="Type here..."
  class="w-full bg-[#161D26] border border-[#2A3A4D] rounded-xl px-4 py-3
         text-sm text-[#E8EDF2] placeholder-[#4A5A6E] font-ui
         focus:outline-none focus:border-[#3DD6F5] focus:ring-1 focus:ring-[#3DD6F5]/30
         transition-colors duration-150"
/>

<textarea
  placeholder="Quick note..."
  rows="3"
  class="w-full bg-[#161D26] border border-[#2A3A4D] rounded-xl px-4 py-3
         text-sm text-[#E8EDF2] placeholder-[#4A5A6E] font-ui resize-none
         focus:outline-none focus:border-[#3DD6F5] focus:ring-1 focus:ring-[#3DD6F5]/30
         transition-colors duration-150"
></textarea>
```

### 5.7 Button

```html
<!-- Primary button -->
<button class="w-full bg-[#3DD6F5] text-[#080C10] font-semibold text-sm rounded-xl py-3 px-4
               font-ui active:scale-[0.98] transition-transform duration-100">
  Action
</button>

<!-- Ghost button -->
<button class="w-full bg-transparent border border-[#2A3A4D] text-[#E8EDF2] font-medium text-sm
               rounded-xl py-3 px-4 font-ui active:bg-[#1C2533] transition-colors duration-150">
  Secondary
</button>

<!-- Icon button (small) -->
<button class="p-2 rounded-lg text-[#8B9BB0] hover:text-[#E8EDF2] hover:bg-[#1C2533]
               transition-colors duration-150">
  <!-- SVG icon 18px -->
</button>
```

### 5.8 Progress Bar

```html
<!-- Resource usage bar -->
<div class="h-1.5 bg-[#1C2533] rounded-full overflow-hidden">
  <div class="h-full rounded-full bg-[#22D47A]" style="width: 45%"></div>
  <!-- danger: bg-[#F5564A], warning: bg-[#F5A623] -->
</div>
```

### 5.9 Language Toggle

```html
<button class="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#161D26]
               border border-[#2A3A4D] text-xs font-medium text-[#8B9BB0] font-ui
               active:bg-[#1C2533] transition-colors">
  <span>VI</span>
  <span class="text-[#4A5A6E]">/</span>
  <span class="text-[#3DD6F5]">EN</span>
</button>
```

---

## 6. Navigation

### Bottom Tab Bar (Mobile Primary Nav)

**Pattern:** 5 visible tabs + "More" sheet for remaining modules.

**Tab order (5 visible):**
1. Home (Morning Briefing)
2. WordPress Monitor
3. Trading Journal
4. Content Pipeline
5. More (expands to: Dev Tracker, Learning Tracker, Auto Reports)

**Anatomy:**

```html
<!-- Bottom nav container -->
<nav class="fixed bottom-0 left-0 right-0 z-50
            bg-[#0F1419]/95 backdrop-blur-md
            border-t border-[#1F2D3D]
            pb-safe">  <!-- pb-safe for iPhone home indicator -->
  <div class="max-w-[430px] mx-auto flex items-center justify-around px-2 h-16">

    <!-- Single tab item (active) -->
    <button class="flex flex-col items-center justify-center gap-1 flex-1 h-full
                   text-[#3DD6F5]">
      <svg class="w-5 h-5" .../>
      <span class="text-[10px] font-medium font-ui">Home</span>
    </button>

    <!-- Single tab item (inactive) -->
    <button class="flex flex-col items-center justify-center gap-1 flex-1 h-full
                   text-[#4A5A6E] active:text-[#8B9BB0] transition-colors">
      <svg class="w-5 h-5" .../>
      <span class="text-[10px] font-medium font-ui">WordPress</span>
    </button>

  </div>
</nav>
```

**Rules:**
- Height: 64px (h-16) + safe area padding for iOS
- Active tab: accent color (`#3DD6F5`)
- Inactive tab: muted (`#4A5A6E`)
- No border/pill on active state — pure color change keeps it minimal
- Icon size: 20px (w-5 h-5)
- Label: 10px, `font-medium`
- Never show more than 5 tabs. "More" opens a bottom sheet.

### Top App Bar

```html
<header class="sticky top-0 z-40 bg-[#080C10]/90 backdrop-blur-md border-b border-[#1F2D3D]">
  <div class="flex items-center justify-between px-4 h-14">
    <div>
      <p class="text-[11px] text-[#4A5A6E] font-ui uppercase tracking-wider">Thứ Ba, 03/03</p>
      <p class="text-sm font-semibold text-[#E8EDF2] font-ui">Good morning, Commander</p>
    </div>
    <!-- Language toggle -->
    <button class="...">VI / EN</button>
  </div>
</header>
```

---

## 7. Module Color Coding

Each module has a distinct accent for quick visual identification:

| Module | Accent | Hex |
|---|---|---|
| Morning Briefing | Cyan | `#3DD6F5` |
| WordPress Monitor | Green | `#22D47A` |
| Dev Tracker | Purple | `#A78BFA` |
| Trading Journal | Orange | `#F5A623` |
| Content Pipeline | Pink | `#F472B6` |
| Learning Tracker | Blue | `#60A5FA` |
| Auto Reports | Gray-Teal | `#5EEAD4` |

---

## 8. Motion & Micro-interactions

```css
/* Standard transition */
transition: all 150ms ease;

/* Card press */
.card-pressable:active { transform: scale(0.98); }

/* Status ping (online) */
@keyframes ping { ... } /* Tailwind animate-ping */

/* Skeleton loading */
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position:  200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, #0F1419 25%, #1C2533 50%, #0F1419 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

**Principles:**
- Duration: 100ms (snap), 150ms (standard), 300ms (enter/exit)
- Easing: `ease` for most; `ease-out` for enter; `ease-in` for exit
- `prefers-reduced-motion`: wrap all animations in media query check
- No transform animations that cause layout reflow on mobile

---

## 9. Data Visualization

For trading and stats — use pure CSS/HTML, no chart library on mobile:

```html
<!-- Sparkline via inline SVG -->
<svg viewBox="0 0 80 24" class="w-20 h-6 text-[#22D47A]">
  <polyline points="0,20 20,12 40,16 60,4 80,8"
            fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>

<!-- Mini bar chart via flex -->
<div class="flex items-end gap-0.5 h-8">
  <div class="flex-1 bg-[#22D47A] rounded-t-sm" style="height: 60%"></div>
  <div class="flex-1 bg-[#F5564A] rounded-t-sm" style="height: 40%"></div>
  ...
</div>
```

---

## 10. Responsive Breakpoints

This app is **mobile-first**. Desktop is a bonus.

| Breakpoint | Width | Layout change |
|---|---|---|
| Default (mobile) | 320–430px | Single column, bottom nav |
| `sm` | 640px | Slight padding increase |
| `md` | 768px | 2-column grid for cards |
| `lg` | 1024px | Sidebar nav replaces bottom nav, 3-column |

**Max width container:** `max-w-[430px] mx-auto` for all mobile-targeted content.

---

## 11. Accessibility

- Color contrast: all text meets WCAG AA (4.5:1 body, 3:1 large)
- Touch targets: minimum 44×44px for all interactive elements
- Focus states: `focus-visible:outline-2 focus-visible:outline-[#3DD6F5] focus-visible:outline-offset-2`
- Semantic HTML: use `<nav>`, `<main>`, `<header>`, `<section>`, `<button>`
- `aria-label` on icon-only buttons
- `lang` attribute: `<html lang="vi">` for Vietnamese primary

---

## 12. Performance Constraints

- **Font loading:** `display=swap` on Google Fonts, preconnect
- **Images:** Next.js `<Image>` with proper sizes prop
- **Icons:** SVG inline or Heroicons (no icon font libraries)
- **Animations:** CSS-only, avoid JS animation libraries
- **No heavy deps:** No framer-motion, no recharts on mobile bundle
- FCP target: < 1.5s on mobile 4G (LCP should be text, not image)

---

*Last updated: 2026-03-03 | per-cc v0.1*
