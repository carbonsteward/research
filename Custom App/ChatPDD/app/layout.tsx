import type { Metadata } from 'next'
import './globals.css'
import '../styles/design-system.css'

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
      <body>{children}</body>
    </html>
  )
}
