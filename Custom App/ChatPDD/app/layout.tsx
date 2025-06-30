import type { Metadata } from 'next'
import './globals.css'
import '../styles/design-system.css'
import { AuthProvider } from '@/components/auth/auth-context'

export const metadata: Metadata = {
  title: 'ChatPDD - Carbon Project Feasibility Assistant',
  description: 'Turn climate action into certified reality. Navigate methodologies, assess risks, and accelerate your carbon project success.',
  generator: 'ChatPDD',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
