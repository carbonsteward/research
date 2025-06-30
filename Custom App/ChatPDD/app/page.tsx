import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModernLanding } from "@/components/modern-landing"
import { Leaf } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Modern Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/60 scientific-shadow">
        <div className="container max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg carbon-gradient">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">ChatPDD</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/methodologies" className="text-slate-600 hover:text-emerald-600 soft-transition scientific-text">
                Methodologies
              </Link>
              <Link href="/carbon-verification" className="text-slate-600 hover:text-emerald-600 soft-transition scientific-text">
                Verification Calculator
              </Link>
              <Link href="/dashboard" className="text-slate-600 hover:text-emerald-600 soft-transition scientific-text">
                Dashboard
              </Link>
              <Button variant="outline" size="sm" className="scientific-shadow">
                Sign In
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Modern Landing Content */}
      <main className="flex-1">
        <ModernLanding />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1 rounded-lg carbon-gradient">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">ChatPDD</span>
              </div>
              <p className="text-slate-400 scientific-text mb-4">
                Accelerating global climate action through intelligent carbon project development and management.
              </p>
              <div className="flex gap-4 text-sm text-slate-500">
                <span>© 2024 ChatPDD. All rights reserved.</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/dashboard" className="hover:text-white soft-transition">Dashboard</Link></li>
                <li><Link href="/methodologies" className="hover:text-white soft-transition">Methodologies</Link></li>
                <li><Link href="/carbon-verification" className="hover:text-white soft-transition">Verification Calculator</Link></li>
                <li><Link href="/project/new" className="hover:text-white soft-transition">New Project</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/api/health" className="hover:text-white soft-transition">System Status</Link></li>
                <li><a href="#" className="hover:text-white soft-transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white soft-transition">Support</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
