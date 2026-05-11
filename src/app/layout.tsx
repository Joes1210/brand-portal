import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_APP_NAME ?? 'Brand Portal',
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME ?? 'Brand Portal'}`,
  },
  description: 'Official brand digital asset portal — browse, preview, and download approved brand assets.',
  openGraph: {
    type: 'website',
    siteName: process.env.NEXT_PUBLIC_APP_NAME ?? 'Brand Portal',
  },
  robots: { index: false, follow: false }, // private portal
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#8B5E3C" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
