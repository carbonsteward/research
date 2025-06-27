import { AppHeader } from "@/components/app-header"
import { GeoSpyFloatingButton } from "@/components/main-navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1">
        {children}
      </main>
      <GeoSpyFloatingButton />
    </div>
  )
}
