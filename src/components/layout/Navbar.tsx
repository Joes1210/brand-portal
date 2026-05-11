'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Search, Sun, Moon, Menu, X, Heart } from 'lucide-react'
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
          scrolled ? 'glass border-b shadow-sm' : 'bg-transparent border-b border-transparent',
        )}
        style={{ borderColor: scrolled ? 'var(--border-color)' : 'transparent' }}
      >
        <nav className="mx-auto max-w-[1600px] px-6 lg:px-10 h-16 flex items-center justify-between gap-6">
