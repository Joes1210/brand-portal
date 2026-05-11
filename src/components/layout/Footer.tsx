import Link from 'next/link'

const FOOTER_LINKS = {
  Assets: [
    { href: '/library', label: 'All Assets' },
    { href: '/library?type=image', label: 'Images' },
    { href: '/library?type=video', label: 'Video' },
    { href: '/library?type=pdf', label: 'Brand Guides' },
    { href: '/library?type=svg', label: 'SVG & Vectors' },
  ],
  Resources: [
    { href: '/library?collection=/Brand Guidelines', label: 'Brand Guidelines' },
    { href: '/library?collection=/Brand Logos', label: 'Logo Package' },
    { href: '/library?collection=/Social Media', label: 'Social Templates' },
    { href: '/library?collection=/Photography', label: 'Photography' },
  ],
  Portal: [
    { href: '/', label: 'Home' },
    { href: '/library?favorites=true', label: 'My Favorites' },
    { href: '#', label: 'Request Assets' },
    { href: '#', label: 'Partner Access' },
  ],
}

export function Footer() {
  const year = new Date().getFullYear()
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'Brand Portal'

  return (
    <footer
      className="mt-24 border-t"
      style={{
        borderColor: 'var(--border-color)',
        background: 'var(--bg-secondary)',
      }}
    >
      <div className="mx-auto max-w-[1600px] px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-sm flex items-center justify-center text-sm font-display font-bold"
                style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
              >
                ✦
              </div>
              <span
                className="font-display text-xl font-semibold tracking-wide"
                style={{ color: 'var(--text-primary)' }}
              >
                {appName}
              </span>
            </div>
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              Official brand digital asset portal. Access approved logos, photography,
              guidelines, and marketing materials for partners, dispensaries, and
              internal teams.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse-slow"
                  style={{ background: '#4ade80' }}
                />
                All systems operational
              </span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4
                className="text-xs font-mono uppercase tracking-widest mb-4"
                style={{ color: 'var(--accent)' }}
              >
                {group}
              </h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover-underline transition-colors duration-200"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-16 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--border-color)' }}
        >
          <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            © {year} {appName}. All rights reserved. For authorized use only.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-xs hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
            >
              Usage Guidelines
            </Link>
            <Link
              href="#"
              className="text-xs hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
            >
              Privacy
            </Link>
            <span
              className="text-xs font-mono"
              style={{ color: 'var(--text-muted)' }}
            >
              v1.0.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
