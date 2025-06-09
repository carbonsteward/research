# ChatPDD Design System - Design Tokens

## 🎯 Design Philosophy
**Consistency builds trust. Simplicity enhances usability. Accessibility is non-negotiable.**

---

## 📏 SPACING SYSTEM (8pt Grid)

### Base Unit: 8px
```
space-0:   0px    (none)
space-1:   4px    (hairline)
space-2:   8px    (xs - tight spacing)
space-3:   12px   (sm - compact)
space-4:   16px   (md - default)
space-5:   20px   (lg - comfortable)
space-6:   24px   (xl - loose)
space-8:   32px   (2xl - section spacing)
space-10:  40px   (3xl - component spacing)
space-12:  48px   (4xl - large gaps)
space-16:  64px   (5xl - section dividers)
space-20:  80px   (6xl - major sections)
space-24:  96px   (7xl - page sections)
```

### Semantic Spacing
```
component-padding-sm:   space-4 (16px)
component-padding-md:   space-6 (24px)
component-padding-lg:   space-8 (32px)

section-gap-sm:         space-12 (48px)
section-gap-md:         space-16 (64px)
section-gap-lg:         space-20 (80px)

container-padding:      space-6 (24px)
card-gap:              space-6 (24px)
inline-gap:            space-4 (16px)
```

---

## 📝 TYPOGRAPHY SYSTEM

### Font Stack
```
Primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace
```

### Type Scale (Perfect Fourth - 1.333 ratio)
```
text-xs:    12px / 16px  (0.75rem / 1rem)
text-sm:    14px / 20px  (0.875rem / 1.25rem)
text-base:  16px / 24px  (1rem / 1.5rem)        [Body default]
text-lg:    18px / 28px  (1.125rem / 1.75rem)
text-xl:    20px / 28px  (1.25rem / 1.75rem)
text-2xl:   24px / 32px  (1.5rem / 2rem)       [Card titles]
text-3xl:   30px / 36px  (1.875rem / 2.25rem)  [Section headers]
text-4xl:   36px / 40px  (2.25rem / 2.5rem)    [Page headers]
text-5xl:   48px / 48px  (3rem / 3rem)         [Hero headlines]
text-6xl:   60px / 60px  (3.75rem / 3.75rem)   [Display only]
```

### Font Weights
```
font-light:     300
font-normal:    400  [Body text default]
font-medium:    500  [Emphasis, labels]
font-semibold:  600  [Card titles, buttons]
font-bold:      700  [Section headers, CTAs]
font-extrabold: 800  [Hero headlines only]
```

### Semantic Typography
```
hero-headline:     text-5xl + font-extrabold + tracking-tight
section-header:    text-3xl + font-bold + tracking-tight
subsection-header: text-2xl + font-semibold
card-title:        text-xl + font-semibold
body-large:        text-lg + font-normal
body-default:      text-base + font-normal
body-small:        text-sm + font-normal
caption:           text-xs + font-medium
```

---

## 🎨 COLOR SYSTEM

### Primary Colors (Emerald/Green Theme)
```
primary-50:   #ecfdf5   (very light green backgrounds)
primary-100:  #d1fae5   (light green accents)
primary-200:  #a7f3d0   (subtle highlights)
primary-300:  #6ee7b7   (soft interactions)
primary-400:  #34d399   (secondary buttons)
primary-500:  #10b981   (primary brand color)
primary-600:  #059669   (primary buttons, links)
primary-700:  #047857   (primary button hover)
primary-800:  #065f46   (dark accents)
primary-900:  #064e3b   (darkest accents)
```

### Neutral Colors (Gray Scale)
```
gray-50:   #f9fafb    (page backgrounds)
gray-100:  #f3f4f6    (card backgrounds)
gray-200:  #e5e7eb    (borders, dividers)
gray-300:  #d1d5db    (disabled states)
gray-400:  #9ca3af    (placeholder text)
gray-500:  #6b7280    (secondary text)
gray-600:  #4b5563    (body text)
gray-700:  #374151    (emphasis text)
gray-800:  #1f2937    (headers)
gray-900:  #111827    (primary text, headlines)
```

### Semantic Colors
```
success-50:   #f0fdf4
success-500:  #22c55e
success-600:  #16a34a

warning-50:   #fffbeb
warning-500:  #f59e0b
warning-600:  #d97706

error-50:     #fef2f2
error-500:    #ef4444
error-600:    #dc2626

info-50:      #eff6ff
info-500:     #3b82f6
info-600:     #2563eb
```

### Color Usage
```
background-primary:    white
background-secondary:  gray-50
background-elevated:   white + shadow

text-primary:          gray-900
text-secondary:        gray-600
text-tertiary:         gray-500
text-disabled:         gray-400

border-default:        gray-200
border-focus:          primary-500
border-error:          error-500

surface-primary:       white
surface-secondary:     gray-100
surface-accent:        primary-50
```

---

## 📦 COMPONENT SPACING

### Container Layouts
```
page-container:
  max-width: 1200px
  padding: 0 24px
  margin: 0 auto

section-container:
  padding-top: 64px
  padding-bottom: 64px

content-container:
  max-width: 768px (for text content)
  margin: 0 auto
```

### Card Components
```
card-base:
  padding: 24px
  border-radius: 8px
  border: 1px solid gray-200
  background: white

card-compact:
  padding: 16px
  border-radius: 6px

card-spacious:
  padding: 32px
  border-radius: 12px
```

### Button Spacing
```
button-sm:   padding: 8px 16px
button-md:   padding: 12px 24px  [default]
button-lg:   padding: 16px 32px  [hero CTAs]

button-gap:  16px (between multiple buttons)
```

---

## 📐 LAYOUT GRID

### Breakpoints
```
sm:  640px   (mobile landscape)
md:  768px   (tablet)
lg:  1024px  (desktop)
xl:  1280px  (large desktop)
2xl: 1536px  (extra large)
```

### Grid System
```
mobile (< 640px):    1 column, 16px gutters
tablet (640-1024px): 2-3 columns, 20px gutters
desktop (> 1024px):  3-4 columns, 24px gutters

feature-grid:
  mobile: 1 column
  tablet: 2 columns
  desktop: 3 columns
```

---

## 🎭 ELEVATION & SHADOWS

### Shadow Scale
```
shadow-sm:   0 1px 2px 0 rgba(0, 0, 0, 0.05)
shadow-md:   0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
shadow-lg:   0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
shadow-xl:   0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
```

### Elevation Usage
```
card-default:        shadow-sm
card-hover:          shadow-md
modal/dropdown:      shadow-lg
floating-action:     shadow-xl

border-radius-sm:    4px
border-radius-md:    6px   [default]
border-radius-lg:    8px   [cards]
border-radius-xl:    12px  [hero elements]
```

---

## ⚡ ANIMATION TOKENS

### Duration
```
duration-fast:    150ms  (hover states)
duration-normal:  250ms  (default transitions)
duration-slow:    350ms  (complex animations)
duration-slower:  500ms  (page transitions)
```

### Easing
```
ease-linear:      linear
ease-in:          cubic-bezier(0.4, 0, 1, 1)
ease-out:         cubic-bezier(0, 0, 0.2, 1)    [default]
ease-in-out:      cubic-bezier(0.4, 0, 0.2, 1)
ease-bounce:      cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

---

## 📱 RESPONSIVE DESIGN TOKENS

### Spacing Responsive Scale
```
Mobile:    base spacing * 0.75
Tablet:    base spacing * 1
Desktop:   base spacing * 1.25

section-gap:
  mobile: 48px
  tablet: 64px
  desktop: 80px

component-padding:
  mobile: 16px
  tablet: 24px
  desktop: 32px
```

### Typography Responsive Scale
```
hero-headline:
  mobile: text-4xl (36px)
  tablet: text-5xl (48px)
  desktop: text-6xl (60px)

section-header:
  mobile: text-2xl (24px)
  tablet: text-3xl (30px)
  desktop: text-3xl (30px)
```

---

## 🎯 USAGE GUIDELINES

### Do's
- Always use spacing tokens, never arbitrary values
- Follow the type scale - no custom font sizes
- Maintain consistent vertical rhythm
- Use semantic color names, not hex values
- Test at all breakpoints

### Don'ts
- Don't break the 8pt grid system
- Don't use more than 3 font weights per page
- Don't mix spacing systems
- Don't use colors outside the defined palette
- Don't ignore responsive scaling

---

This design token system provides the foundation for visual consistency across the entire ChatPDD platform. Next, I'll generate the component code that implements these tokens.
