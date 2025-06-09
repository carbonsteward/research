# ChatPDD Style Guide for Development Team

## 🎯 Purpose
This style guide ensures visual consistency across all ChatPDD interfaces by providing clear implementation guidelines for designers and developers.

---

## 📐 LAYOUT SYSTEM IMPLEMENTATION

### Page Structure Template
```tsx
// CORRECT: Consistent page structure
function MyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        {/* Navigation content */}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          title="Page Title"
          description="Clear description"
          background="gradient"
        >
          <Button size="lg" variant="primary">Primary CTA</Button>
          <Button size="lg" variant="secondary">Secondary CTA</Button>
        </HeroSection>

        {/* Content Sections */}
        <SectionWithHeader
          title="Section Title"
          description="Section description"
          spacing="md"
        >
          <Grid cols={3} gap="md">
            {/* Grid content */}
          </Grid>
        </SectionWithHeader>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        {/* Footer content */}
      </footer>
    </div>
  )
}
```

### Container Usage Guidelines

```tsx
// ✅ CORRECT: Use design system containers
<Container size="default">  {/* 1200px max */}
  <SectionWithHeader title="Features">
    <Grid cols={3}>
      <FeatureCard title="..." description="..." />
    </Grid>
  </SectionWithHeader>
</Container>

// ❌ WRONG: Custom containers without system
<div className="max-w-6xl mx-auto px-8">
  <div className="grid grid-cols-3 gap-12">
    {/* Inconsistent spacing */}
  </div>
</div>
```

---

## 📝 TYPOGRAPHY IMPLEMENTATION

### Heading Hierarchy

```tsx
// ✅ CORRECT: Semantic heading usage
<Heading level={1} variant="hero">
  Turn Climate Action Into Certified Reality  {/* Page hero only */}
</Heading>

<Heading level={2} variant="section">
  Platform Features  {/* Major sections */}
</Heading>

<Heading level={3} variant="card">
  Methodology Explorer  {/* Card titles, subsections */}
</Heading>

// ❌ WRONG: Skipping levels or wrong variants
<h1 className="text-2xl">Card Title</h1>  {/* Wrong level for content */}
<h3 className="text-6xl">Page Title</h3>  {/* Wrong hierarchy */}
```

### Text Content Guidelines

```tsx
// ✅ CORRECT: Semantic text components
<Text variant="body-large" color="primary">
  Main introductory text with emphasis
</Text>

<Text variant="body" color="secondary">
  Standard body text for descriptions
</Text>

<Text variant="caption" color="tertiary">
  Small labels, metadata, timestamps
</Text>

// ❌ WRONG: Random text classes
<p className="text-lg text-blue-600">Random styling</p>
<span className="text-xs font-bold">Inconsistent emphasis</span>
```

---

## 🎨 COLOR USAGE RULES

### Semantic Color Application

```tsx
// ✅ CORRECT: Semantic color usage
<div className="bg-primary-50 border border-primary-200">  {/* Accent backgrounds */}
  <Button className="bg-primary-600 hover:bg-primary-700">  {/* Primary actions */}
    Get Started
  </Button>
</div>

<Text color="secondary">  {/* Body text */}
  Navigate carbon methodologies and assess risks
</Text>

<Text color="tertiary">  {/* Supporting text */}
  Last updated 2 minutes ago
</Text>

// ❌ WRONG: Arbitrary colors
<div className="bg-green-300 text-purple-800">  {/* Non-semantic colors */}
  <button className="bg-blue-500 hover:bg-red-400">  {/* Inconsistent palette */}
    Confusing Action
  </button>
</div>
```

### Color Accessibility Guidelines

```tsx
// ✅ CORRECT: High contrast combinations
text-gray-900 on bg-white        // 21:1 contrast ratio
text-gray-600 on bg-white        // 7:1 contrast ratio
text-white on bg-primary-600     // 4.5:1 contrast ratio

// ❌ WRONG: Poor contrast
text-gray-400 on bg-gray-200     // 2:1 - fails WCAG
text-primary-300 on bg-white     // 3:1 - fails AA large text
```

---

## 📦 COMPONENT USAGE PATTERNS

### Card Components

```tsx
// ✅ CORRECT: Consistent card usage
<Grid cols={3} gap="md">
  <FeatureCard
    title="Risk Assessment"
    description="Evaluate physical and transitional climate risks"
    icon={<Shield className="h-6 w-6" />}
    onClick={() => navigate('/risk-assessment')}
  />
</Grid>

// ❌ WRONG: Inconsistent card styling
<div className="grid grid-cols-3 gap-8">
  <div className="p-6 border rounded-lg shadow-sm">  {/* Manual styling */}
    <h3 className="text-xl font-semibold mb-4">Risk Assessment</h3>
    <p className="text-gray-600">Description text</p>
  </div>
  <div className="p-4 border-2 rounded-xl shadow-lg">  {/* Different styling */}
    <h3 className="text-lg font-bold mb-2">Other Feature</h3>
    <p className="text-gray-500">Different description</p>
  </div>
</div>
```

### Button Patterns

```tsx
// ✅ CORRECT: Consistent button hierarchy
<Stack direction="row" spacing="md">
  <Button size="lg" variant="primary">
    Start Free Assessment  {/* Primary action */}
  </Button>
  <Button size="lg" variant="secondary">
    Watch Demo  {/* Secondary action */}
  </Button>
</Stack>

// ❌ WRONG: Inconsistent button styling
<div className="flex gap-4">
  <button className="px-8 py-4 bg-blue-600 text-white rounded-lg">
    Primary
  </button>
  <button className="px-6 py-3 border border-gray-300 rounded-md">
    Secondary
  </button>
</div>
```

---

## 📱 RESPONSIVE DESIGN PATTERNS

### Mobile-First Implementation

```tsx
// ✅ CORRECT: Mobile-first responsive design
<Grid
  cols={3}  // Automatically responsive: 1 col mobile, 2 tablet, 3 desktop
  gap="md"
  className="mb-8"
>
  <FeatureCard title="..." description="..." />
</Grid>

<Heading
  level={1}
  variant="hero"
  className="text-4xl md:text-5xl lg:text-6xl"  // Responsive scaling
>
  Responsive Headline
</Heading>

// ❌ WRONG: Desktop-first or non-responsive
<div className="grid grid-cols-3 gap-8">  {/* Breaks on mobile */}
  <div>Content</div>
</div>

<h1 className="text-6xl">  {/* Too large on mobile */}
  Non-responsive Title
</h1>
```

### Spacing Responsive Behavior

```tsx
// ✅ CORRECT: System handles responsive spacing
<Section spacing="md">  {/* 48px mobile, 64px tablet, 80px desktop */}
  <Container>
    <Stack spacing="lg">  {/* Consistent spacing scale */}
      <Heading level={2}>Section Title</Heading>
      <Grid cols={3} gap="md">  {/* Responsive grid */}
        {/* Content */}
      </Grid>
    </Stack>
  </Container>
</Section>

// ❌ WRONG: Manual responsive spacing
<section className="py-12 md:py-16 lg:py-24">  {/* Arbitrary values */}
  <div className="container mx-auto px-4 md:px-6 lg:px-8">
    <div className="space-y-8 md:space-y-12 lg:space-y-16">
      {/* Inconsistent spacing system */}
    </div>
  </div>
</section>
```

---

## 🚀 PERFORMANCE GUIDELINES

### CSS Loading Strategy

```tsx
// ✅ CORRECT: Load design system CSS first
import '../styles/design-system.css'  // Load before other styles
import './component-specific.css'     // Component overrides

// Use CSS variables for dynamic values
<div style={{
  '--dynamic-color': userPreference.primaryColor,
  backgroundColor: 'var(--dynamic-color)'
}}>
```

### Component Optimization

```tsx
// ✅ CORRECT: Memoized design system components
const MemoizedFeatureCard = React.memo(FeatureCard)

// Lazy load heavy design system features
const InteractiveDemo = lazy(() => import('./InteractiveDemo'))

// ❌ WRONG: Inline styles that break caching
<div style={{
  padding: '24px',           // Use design system classes instead
  backgroundColor: '#10b981'  // Use CSS variables
}}>
```

---

## ♿ ACCESSIBILITY REQUIREMENTS

### Focus Management

```tsx
// ✅ CORRECT: Accessible interactive elements
<Button
  onClick={handleAction}
  aria-label="Start carbon project assessment"
  className="focus:outline-none focus:ring-2 focus:ring-primary-500"
>
  Get Started
</Button>

<Card
  clickable
  onClick={handleCardClick}
  onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
  tabIndex={0}
  role="button"
  aria-label="Open methodology explorer"
>
  Card content
</Card>

// ❌ WRONG: Inaccessible interactions
<div onClick={handleClick}>  {/* Not keyboard accessible */}
  Clickable content
</div>
```

### Color Accessibility

```tsx
// ✅ CORRECT: Accessible color combinations
<Text color="primary">High contrast text (21:1)</Text>
<Text color="secondary">Body text (7:1 contrast)</Text>

// Error states with multiple indicators
<div className="border border-error-500 bg-error-50">
  <Text color="primary" className="flex items-center gap-2">
    <AlertCircle className="h-4 w-4 text-error-600" />
    Error message with icon and color
  </Text>
</div>

// ❌ WRONG: Color-only information
<span className="text-red-500">Error</span>  {/* No icon or additional context */}
<div className="bg-green-200">Success</div>   {/* Color-only feedback */}
```

---

## 🔧 DEBUGGING & MAINTENANCE

### CSS Custom Properties Inspection

```css
/* Debug design system values */
:root {
  --debug-spacing: 1px solid red;
  --debug-containers: 1px solid blue;
}

/* Temporarily add to debug layout */
.debug .container { border: var(--debug-containers); }
.debug .card { border: var(--debug-spacing); }
```

### Component Validation

```tsx
// ✅ Add validation for required design system props
interface HeadingProps {
  children: React.ReactNode
  level: 1 | 2 | 3 | 4 | 5 | 6  // Enforce semantic levels
  variant?: 'hero' | 'section' | 'subsection' | 'card'
}

// Warn about design system violations in development
if (process.env.NODE_ENV === 'development') {
  if (level === 1 && variant !== 'hero') {
    console.warn('H1 elements should use hero variant for consistency')
  }
}
```

---

## 📋 QUALITY CHECKLIST

### Before Code Review
- [ ] All spacing uses design system tokens (no arbitrary values)
- [ ] Typography follows semantic hierarchy (H1 → H2 → H3)
- [ ] Colors use semantic naming (no hardcoded hex values)
- [ ] Components are responsive across all breakpoints
- [ ] Focus states are visible and accessible
- [ ] Text contrast meets WCAG AA standards (4.5:1 minimum)

### Before Production Deploy
- [ ] Design system CSS loads before component styles
- [ ] No console warnings about design system violations
- [ ] All interactive elements are keyboard accessible
- [ ] Screen reader testing completed
- [ ] Performance budget maintained (< 100kb CSS)

---

## 🆘 COMMON MISTAKES & FIXES

### Spacing Issues
```tsx
// ❌ WRONG: Manual spacing
<div className="mt-8 mb-12 mx-4">
  <div className="space-y-6">
    <h2 className="mb-4">Title</h2>
  </div>
</div>

// ✅ CORRECT: System spacing
<Section spacing="md">
  <Container>
    <Stack spacing="lg">
      <Heading level={2}>Title</Heading>
    </Stack>
  </Container>
</Section>
```

### Typography Problems
```tsx
// ❌ WRONG: Size-based thinking
<h3 className="text-2xl font-bold">Card Title</h3>
<h2 className="text-lg font-medium">Small Header</h2>

// ✅ CORRECT: Semantic hierarchy
<Heading level={2} variant="section">Large Header</Heading>
<Heading level={3} variant="card">Card Title</Heading>
```

### Color Inconsistencies
```tsx
// ❌ WRONG: Random color usage
<div className="bg-green-100 text-green-800 border border-green-300">
  <div className="bg-emerald-200 text-emerald-900">
    Mixed green shades
  </div>
</div>

// ✅ CORRECT: Consistent color system
<div className="bg-primary-50 text-primary-800 border border-primary-200">
  <div className="bg-primary-100 text-primary-900">
    Consistent primary colors
  </div>
</div>
```

---

This style guide should be referenced during all development and design reviews to maintain the visual consistency that builds user trust and creates a professional experience.
