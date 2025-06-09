# ChatPDD - Carbon Project Feasibility Assistant

A comprehensive platform for carbon project success - from feasibility analysis to certification. Navigate methodologies, assess risks, and accelerate your path to impact.

![ChatPDD Platform](https://img.shields.io/badge/Platform-Next.js%2015-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)
![Design System](https://img.shields.io/badge/Design%20System-Implemented-green?style=flat-square)

## 🌟 Features

- **Methodology Explorer**: Browse and compare carbon standards from leading certification bodies
- **Risk Assessment**: Evaluate physical and transitional climate risks by location and project type
- **Policy Navigator**: Stay informed about relevant climate policies and regulations
- **Feasibility Reports**: Generate comprehensive reports with actionable insights
- **Certification Guidance**: Step-by-step guidance through certification processes

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/chatpdd.git
cd chatpdd

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🎨 Design System

ChatPDD implements a comprehensive design system ensuring visual consistency across all interfaces.

### Key Design Principles

- **8pt Grid System**: Systematic spacing using multiples of 8px
- **Typography Scale**: Perfect Fourth ratio (1.333) for hierarchical text sizing
- **Semantic Colors**: Consistent color palette with meaningful naming
- **Mobile-First**: Responsive design optimized for all screen sizes

### Design System Files

```
├── styles/
│   └── design-system.css          # Core design tokens and CSS variables
├── components/
│   └── design-system/
│       └── layout-components.tsx  # Reusable layout components
└── .bmad-core/
    └── design-system/
        ├── design-tokens.md       # Complete design token documentation
        └── style-guide.md         # Development team style guide
```

### Design Tokens Usage

```css
/* Spacing System */
--space-4: 16px;    /* Standard unit */
--space-6: 24px;    /* Component padding */
--space-8: 32px;    /* Section spacing */

/* Typography Scale */
--text-3xl: 1.875rem;  /* Section headers */
--text-4xl: 2.25rem;   /* Hero titles */
--text-5xl: 3rem;      /* Large hero titles */

/* Color System */
--primary-600: #059669;   /* Primary actions */
--gray-600: #4b5563;     /* Body text */
--gray-900: #111827;     /* Headings */
```

### Component Usage

```tsx
import { Container, Section, Heading, Grid, FeatureCard } from '@/components/design-system/layout-components'

function MyPage() {
  return (
    <Section spacing="md" background="secondary">
      <Container size="default">
        <Heading level={2} variant="section">
          Platform Features
        </Heading>
        <Grid cols={3} gap="md">
          <FeatureCard
            title="Risk Assessment"
            description="Evaluate climate risks"
            icon={<Shield />}
          />
        </Grid>
      </Container>
    </Section>
  )
}
```

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS + Custom Design System
- **UI Components**: Radix UI + shadcn/ui
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Vercel

### Project Structure

```
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/                # shadcn/ui components
│   └── design-system/     # Custom design system components
├── lib/                   # Utility functions
├── styles/                # Global styles and design system CSS
├── public/                # Static assets
└── .bmad-core/           # Design system documentation
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript compiler check
```

### Design System Development

The design system is built with:
- **CSS Custom Properties** for design tokens
- **TypeScript Components** for layout consistency
- **Mobile-First Responsive Design**
- **WCAG AA Accessibility Standards**

#### Adding New Components

1. Follow the design token system in `styles/design-system.css`
2. Use semantic spacing and typography scales
3. Implement responsive behavior with mobile-first approach
4. Ensure proper accessibility attributes

#### Style Guide Compliance

Before committing code, ensure:
- [ ] All spacing uses design system tokens
- [ ] Typography follows semantic hierarchy (H1 → H2 → H3)
- [ ] Colors use semantic naming
- [ ] Components are responsive across breakpoints
- [ ] Text contrast meets WCAG AA standards (4.5:1 minimum)

## 📱 Responsive Design

The platform is optimized for all screen sizes:

- **Mobile**: 375px+ (Priority focus)
- **Tablet**: 768px+ (Optimized layouts)
- **Desktop**: 1024px+ (Full feature set)
- **Large Desktop**: 1200px+ (Spacious layouts)

## ♿ Accessibility

ChatPDD follows WCAG 2.1 AA guidelines:

- Semantic HTML structure
- Keyboard navigation support
- Screen reader compatibility
- High contrast color combinations
- Focus management and visual indicators

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
npm run build
vercel --prod
```

### Environment Variables

Create `.env.local` for development:

```env
DATABASE_URL=your_postgres_connection_string
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📊 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized for excellent user experience
- **Bundle Size**: < 200KB initial load
- **Design System CSS**: < 50KB gzipped

## 🔄 Recent Updates

### Design System Implementation (2024)
- ✅ Comprehensive design token system
- ✅ Consistent spacing and typography
- ✅ Mobile-first responsive components
- ✅ WCAG AA accessibility compliance
- ✅ Performance-optimized CSS architecture

### Landing Page Redesign
- ✅ Hero section with clear value proposition
- ✅ Feature showcase with consistent cards
- ✅ Social proof and testimonials
- ✅ Responsive design across all devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the design system guidelines in `.bmad-core/design-system/style-guide.md`
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check `.bmad-core/design-system/` for design system docs
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Development**: See `ChatPDD 기획문서/` for detailed technical specifications

---

**Built with ❤️ for accelerating climate action through better carbon project development**
