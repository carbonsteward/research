'use client'

import React from 'react'
import { MUIProvider } from '@/components/providers/mui-provider'
import { AppNavigation } from '@/components/mui/layout/app-navigation'
import { PortfolioDashboard } from '@/components/mui/dashboard/portfolio-dashboard'

export default function MUIDashboardPage() {
  return (
    <MUIProvider>
      <AppNavigation>
        <PortfolioDashboard />
      </AppNavigation>
    </MUIProvider>
  )
}
