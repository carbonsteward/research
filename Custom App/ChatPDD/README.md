# ChatPDD - Carbon Project Feasibility Study Assistant

> **Professional Material-UI carbon project management platform with advanced form workflows and real-time analytics**

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-v6-blue)](https://mui.com/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com/)

## 🌟 **Latest: Material-UI Mega Design Upgrade (v2.0.0)**

ChatPDD has been transformed with a comprehensive Material-UI design system, featuring professional interfaces inspired by isometric.com, advanced form workflows, and sophisticated data visualization components.

### 🎯 **Key Features**

- **🎨 Professional Material-UI Design System** - Custom theme with sophisticated color palettes and responsive layouts
- **📋 Advanced Form Components** - Multi-step wizards with React Hook Form + Zod validation
- **📊 Data Visualization Dashboard** - Interactive charts and analytics with Recharts integration
- **🔍 AI-Powered Location Detection** - GeoSpy AI using OpenAI Vision API for photo-based coordinates
- **🏗️ Project Management** - Comprehensive carbon project lifecycle management
- **📈 Risk Assessment Tools** - Automated scoring with scenario analysis
- **🌍 Climate Data Integration** - Real-time policy and risk data from multiple APIs

## 🚀 **Quick Start**

### **Live Demo**
- **🎛️ MUI Dashboard**: https://chatpdd-carbon-mitigation.vercel.app/dashboard/mui
- **📝 Forms Demo**: https://chatpdd-carbon-mitigation.vercel.app/forms-demo
- **🏠 Main App**: https://chatpdd-carbon-mitigation.vercel.app/

### **Local Development**
```bash
# Clone and install
git clone https://github.com/your-username/ChatPDD.git
cd ChatPDD
pnpm install

# Start development server
pnpm dev

# Access the application
open http://localhost:3000
```

## 🎨 **Material-UI Design System**

### **Custom Theme Features**
- **Isometric.com-inspired design** with professional color palettes
- **Responsive breakpoints** optimized for carbon project workflows
- **Custom component overrides** for consistent Material-UI styling
- **Advanced typography system** with enhanced readability
- **Dark mode preparation** with semantic color tokens

### **Component Architecture**
```
components/mui/
├── layout/           # Navigation and app structure
│   └── app-navigation.tsx
├── dashboard/        # Portfolio and analytics
│   └── portfolio-dashboard.tsx
├── charts/           # Data visualization
│   └── carbon-metrics-chart.tsx
├── project/          # Project management
│   └── project-card.tsx
└── forms/            # Advanced form components
    ├── project-form.tsx
    ├── methodology-filter-form.tsx
    └── risk-assessment-form.tsx
```

## 📋 **Advanced Form System**

### **Project Creation Form**
Multi-step wizard with comprehensive validation:
- **Step 1**: Basic information and project type selection
- **Step 2**: Location, methodology, and GPS coordinates
- **Step 3**: Timeline, financial planning, and credit estimation
- **Step 4**: Team management and risk assessment
- **Step 5**: Review and submission with readiness scoring

### **Methodology Filter Form**
Advanced filtering system with:
- **Real-time search** with debounced queries
- **Multi-criteria filtering** with saved configurations
- **Advanced controls** for complexity, cost, and risk parameters
- **Bookmark management** for frequently used filter sets

### **Risk Assessment Form**
Comprehensive evaluation tool featuring:
- **5 risk categories** with automated scoring
- **Scenario planning** with probability and impact analysis
- **Confidence ratings** and mitigation planning
- **Visual risk indicators** with color-coded severity levels

## 📊 **Data Visualization**

### **Carbon Metrics Dashboard**
- **Interactive charts** with multiple visualization types
- **Portfolio analytics** with trend analysis and projections
- **Project performance** tracking with ROI calculations
- **Risk distribution** analysis with heat maps

### **Chart Components**
```typescript
// Advanced carbon metrics visualization
<CarbonMetricsChart 
  data={portfolioData}
  height={400}
  interactive={true}
  fullscreenMode={true}
/>

// Project portfolio dashboard
<PortfolioDashboard 
  projects={userProjects}
  showAnalytics={true}
  enableFiltering={true}
/>
```

## 🔧 **Technical Stack**

### **Frontend**
- **Next.js 15.2.4** - React framework with App Router
- **Material-UI v6** - Professional component library
- **React 19** - Latest React features and optimizations
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Performant form state management
- **Zod** - Schema validation with TypeScript inference

### **Form Validation**
```typescript
// Advanced validation with Zod
const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  type: z.enum(['AFOLU', 'ENERGY', 'WASTE', 'TRANSPORT']),
  timeline: z.object({
    startDate: z.date(),
    endDate: z.date(),
  }).refine(data => data.endDate > data.startDate, {
    message: 'End date must be after start date',
  }),
  // ... comprehensive field validation
})
```

### **Backend & APIs**
- **PostgreSQL** - Primary database with Prisma ORM
- **OpenAI Vision API** - AI-powered image analysis
- **Google Maps API** - Geocoding and location services
- **Climate Policy Radar** - Real-time policy data
- **Vercel** - Deployment and hosting platform

## 🎛️ **Dashboard Features**

### **Portfolio Management**
- **Project overview** with key metrics and status tracking
- **Financial analytics** with revenue and ROI calculations
- **Risk monitoring** with automated alert systems
- **Team collaboration** with role-based access controls

### **Interactive Elements**
- **Responsive navigation** with collapsible sidebar
- **Real-time notifications** with badge indicators
- **Advanced data tables** with sorting and filtering
- **Export capabilities** for reports and analytics

## 🔍 **AI Integration**

### **GeoSpy AI Features**
- **Photo location detection** using OpenAI Vision API
- **GPS coordinate extraction** from project site images
- **Smart location suggestions** with Google Maps validation
- **A/B testing framework** for optimization

```typescript
// AI-powered location detection
const analyzeProjectPhoto = async (imageFile: File) => {
  const result = await fetch('/api/geospy/analyze', {
    method: 'POST',
    body: formData
  })
  return result.json() // { coordinates, confidence, description }
}
```

## 📈 **Performance & Security**

### **Optimization Features**
- **Component lazy loading** with Next.js dynamic imports
- **Image optimization** with automatic WebP conversion
- **Bundle splitting** for optimal loading performance
- **Memoized calculations** for complex data processing

### **Security Measures**
- **Input validation** with Zod schemas
- **API rate limiting** with Redis-based throttling
- **Secure authentication** with session management
- **HTTPS enforcement** for all communications

## 🧪 **Testing & Quality**

### **Testing Framework**
- **Jest** - Unit and integration testing
- **Playwright** - End-to-end testing across browsers
- **React Testing Library** - Component testing
- **TypeScript** - Compile-time error checking

### **Quality Assurance**
```bash
# Run all tests
pnpm test

# E2E testing
pnpm test:e2e

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## 🚀 **Deployment**

### **Environment Setup**
```bash
# Required environment variables
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
GOOGLE_MAPS_API_KEY=AIza...
CLIMATE_POLICY_RADAR_API_KEY=...
```

### **Production Deployment**
- **Automatic deployment** from GitHub via Vercel
- **Database migrations** with zero-downtime strategies
- **Health monitoring** with comprehensive status checks
- **Performance tracking** with Lighthouse CI

## 📚 **Documentation**

### **API Endpoints**
- `GET/POST /api/projects` - Project management
- `GET/POST /api/methodologies` - Carbon methodology database
- `POST /api/geospy/analyze` - AI location detection
- `GET /api/health` - System health monitoring

### **Component Documentation**
- **Storybook integration** (planned)
- **TypeScript interfaces** with comprehensive JSDoc
- **Usage examples** in demo pages
- **Best practices** guide for form development

## 🎨 **Design System (Legacy)**

### **Previous Design System**
ChatPDD previously implemented a comprehensive design system with:

- **8pt Grid System**: Systematic spacing using multiples of 8px
- **Typography Scale**: Perfect Fourth ratio (1.333) for hierarchical text sizing
- **Semantic Colors**: Consistent color palette with meaningful naming
- **Mobile-First**: Responsive design optimized for all screen sizes

### **Migration to Material-UI**
The platform has been upgraded to Material-UI v6 while maintaining:
- **Design consistency** across all interfaces
- **Responsive behavior** optimized for mobile and desktop
- **Accessibility standards** with WCAG AA compliance
- **Performance optimization** with component lazy loading

## 🤝 **Contributing**

### **Development Workflow**
1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing Material-UI feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### **Code Standards**
- **TypeScript strict mode** enabled
- **ESLint + Prettier** for code formatting
- **Conventional commits** for clear history
- **Material-UI design patterns** for consistency

## 📞 **Support & Contact**

- **Documentation**: [Project Wiki](https://github.com/your-username/ChatPDD/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/ChatPDD/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/ChatPDD/discussions)

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Material-UI Team** - Outstanding component library
- **Vercel** - Excellent deployment platform
- **OpenAI** - AI-powered image analysis capabilities
- **Isometric.com** - Design inspiration for professional interfaces
- **Carbon Standards Organizations** - Methodology data and validation

---

**Built with ❤️ for sustainable carbon project development**