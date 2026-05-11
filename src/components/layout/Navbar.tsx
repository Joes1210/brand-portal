'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Search, Sun, Moon, Menu, X, Grid3X3, Heart, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavbarProps {
  onSearchOpen?: () => void
}

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/library', label: 'Asset Library' },
  { href: '/library?type=image', label: 'Images' },
  { href: '/library?type=video', label: 'Video' },
  { href: '/library?type=pdf', label: 'Guides' },
]

export function Navbar({ onSearchOpen }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'glass border-b shadow-sm'
            : 'bg-transparent border-b border-transparent',
        )}
        style={{ borderColor: scrolled ? 'var(--border-color)' : 'transparent' }}
      >
        <nav className="mx-auto max-w-[1600px] px-6 lg:px-10 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div
              className="w-8 h-8 rounded-sm flex items-center justify-center text-sm font-display font-bold transition-transform duration-300 group-hover:scale-110"
              style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
            >
              ✦
            </div>
            <span
              className="font-display text-xl font-semibold tracking-wide hidden sm:block"
              style={{ color: 'var(--text-primary)' }}
            >
              {process.env.NEXT_PUBLIC_APP_NAME ?? 'Brand Portal'}
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="hover-underline text-sm font-medium tracking-wide transition-colors duration-200"
                style={{ color: 'var(--text-secondary)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={onSearchOpen}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                'hidden sm:flex',
              )}
              style={{
                color: 'var(--text-muted)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
              }}
              aria-label="Search assets"
            >
              <Search size={14} />
              <span className="hidden md:block text-xs" style={{ color: 'var(--text-muted)' }}>
                Search assets
              </span>
              <kbd
                className="hidden md:block text-xs px-1.5 py-0.5 rounded font-mono"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-color)',
                }}
              >
                ⌘K
              </kbd>
            </button>

            {/* Quick links */}
            <Link
              href="/library?favorites=true"
              className="p-2 rounded-lg transition-colors duration-200 hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Favorites"
            >
              <Heart size={16} />
            </Link>

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg transition-colors duration-200 hover:opacity-70"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}

            {/* Auth stub */}
            <button
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium tracking-wide uppercase transition-all duration-200 hover:opacity-80"
              style={{
                background: 'var(--accent)',
                color: 'var(--bg-primary)',
              }}
            >
              Sign In
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden glass flex flex-col pt-20 px-6 pb-6"
          style={{ borderTop: '1px solid var(--border-color)' }}
        >
          <nav className="flex flex-col gap-1 mt-4">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-3 px-4 rounded-lg text-base font-medium transition-colors duration-200"
                style={{ color: 'var(--text-primary)' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-3">
            <button
              onClick={onSearchOpen}
              className="flex items-center gap-3 py-3 px-4 rounded-lg"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
              }}
            >
              <Search size={16} />
              Search assets
            </button>
            <button
              className="py-3 px-4 rounded-lg font-medium"
              style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </>
  )
}
