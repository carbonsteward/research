/**
 * Enhanced Stats Dashboard Component Tests
 * Tests the stats dashboard component functionality
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { EnhancedStatsDashboard } from '@/components/enhanced-stats-dashboard'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock recharts to avoid canvas rendering issues
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
}))

describe('EnhancedStatsDashboard', () => {
  it('should render the dashboard title', () => {
    render(<EnhancedStatsDashboard />)

    expect(screen.getByText('Platform Analytics')).toBeInTheDocument()
    expect(screen.getByText('Real-time insights into global carbon project development')).toBeInTheDocument()
  })

  it('should display carbon standards metrics', () => {
    render(<EnhancedStatsDashboard />)

    // Check for carbon-specific metrics
    expect(screen.getByText('Carbon Standards')).toBeInTheDocument()
    expect(screen.getByText('Methodologies')).toBeInTheDocument()
    expect(screen.getByText('ICROA Approved')).toBeInTheDocument()
    expect(screen.getByText('CORSIA Approved')).toBeInTheDocument()
  })

  it('should show statistical values', () => {
    render(<EnhancedStatsDashboard />)

    // Check for numeric values (these are the values we set in the component)
    expect(screen.getByText('90')).toBeInTheDocument() // Carbon Standards
    expect(screen.getByText('47')).toBeInTheDocument() // Methodologies
    expect(screen.getByText('67')).toBeInTheDocument() // ICROA Approved
    expect(screen.getByText('42')).toBeInTheDocument() // CORSIA Approved
  })

  it('should have Live Data toggle button', () => {
    render(<EnhancedStatsDashboard />)

    expect(screen.getByText('Live Data')).toBeInTheDocument()
  })

  it('should display trend charts', () => {
    render(<EnhancedStatsDashboard />)

    // Check for chart components
    expect(screen.getAllByTestId('chart-container')).toHaveLength(5) // 4 stat cards + 1 main chart
  })

  it('should show metric selector buttons', () => {
    render(<EnhancedStatsDashboard />)

    // Check for metric selector buttons
    expect(screen.getByText('Carbon Standards')).toBeInTheDocument()
    expect(screen.getByText('Methodologies')).toBeInTheDocument()
    expect(screen.getByText('ICROA Approved')).toBeInTheDocument()
    expect(screen.getByText('CORSIA Approved')).toBeInTheDocument()
  })

  it('should display insights section', () => {
    render(<EnhancedStatsDashboard />)

    // Check for insights
    expect(screen.getByText('Peak Activity')).toBeInTheDocument()
    expect(screen.getByText('Top Region')).toBeInTheDocument()
    expect(screen.getByText('Success Rate')).toBeInTheDocument()
  })

  it('should render without crashing', () => {
    const { container } = render(<EnhancedStatsDashboard />)
    expect(container).toBeInTheDocument()
  })
})
