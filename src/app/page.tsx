'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ArrowRight, Sparkles, Clock } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CollectionCard, CollectionCardSkeleton } from '@/components/assets/CollectionCard'
import { AssetCard, AssetCardSkeleton } from '@/components/assets/AssetCard'
import { AssetModal } from '@/components/assets/AssetModal'
import { SearchModal } from '@/components/assets/SearchModal'
import { useAssets, useCollections } from '@/hooks'
import type { Asset } from '@/types'

export default function HomePage() {
  const { assets, isLoading: assetsLoading } = useAssets()
  const { collections, isLoading: collectionsLoading } = useCollections()
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)

  const recentAssets = assets.filter(a => a.isNew).slice(0, 6)
  const allRecent = assets.slice(0, 6)

  const relatedAssets = selectedAsset
    ? assets.filter(a => a.id !== selectedAsset.id && a.collection === selectedAsset.collection).slice(0, 3)
    : []

  const stats = [
    { label: 'Total Assets', value: assets.length || '—' },
    { label: 'Collections', value: collections.length || '—' },
    { label: 'New This Week', value: assets.filter(a => a.isNew).length || '—' },
    { label: 'File Types', value: assets.map(a => a.type).filter((v, i, arr) => arr.indexOf(v) === i).length || '—' },
  ]

  return (
    <>
      <Navbar onSearchOpen={() => setSearchOpen(true)} />

      <main>
        {/* Hero */}
        <section
          className="noise-overlay relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden"
          style={{ background: 'var(--gradient-hero)' }}
        >
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: 'var(--accent)' }}
          />
          <div
            className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ background: 'var(--accent-gold)' }}
          />

          <div className="relative z-10 max-w-4xl mx-auto">

            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img
                src="/Logo_3d.png"
                alt="Grab & Go"
                className="h-36 w-auto drop-shadow-2xl"
              />
            </div>

            {/* Eyebrow */}
            <div
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest px-4 py-2 rounded-full mb-8"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--accent-gold)',
                color: 'var(--accent-gold)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <Sparkles size={11} />
              Official Brand Asset Portal
            </div>

            {/* Headline */}
            <h1
              className="font-display text-6xl sm:text-7xl lg:text-8xl font-semibold tracking-tight leading-[0.9] mb-6"
              style={{ color: '#ffffff' }}
            >
              Every asset.
              <br />
              <em className="not-italic" style={{ color: 'var(--accent-gold)' }}>
                Perfectly curated.
              </em>
            </h1>

            <p
              className="text-lg leading-relaxed max-w-xl mx-auto mb-10"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              Your single source of truth for logos, photography, templates, brand
              guidelines, and all approved creative assets.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-3 px-6 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 hover:opacity-80"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  minWidth: 260,
                }}
              >
                <Search size={15} style={{ color: 'var(--accent-gold)' }} />
                <span>Search assets…</span>
                <kbd
                  className="ml-auto text-xs px-1.5 py-0.5 rounded font-mono"
                  style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.6)' }}
                >
                  ⌘K
                </kbd>
              </button>
              <Link
                href="/library"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 hover:opacity-90"
                style={{ background: 'var(--accent-gold)', color: '#0d2b0d', fontWeight: 700 }}
              >
                Browse Library
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div
            className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-0 overflow-x-auto"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
          >
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="flex-1 min-w-[140px] py-5 px-6 text-center"
                style={{
                  borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  background: 'rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div
                  className="font-display text-3xl font-semibold"
                  style={{ color: 'var(--accent-gold)' }}
                >
                  {stat.value}
                </div>
                <div className="text-xs font-mono uppercase tracking-wider mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Collections */}
        <section className="mx-auto max-w-[1600px] px-6 lg:px-10 py-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--accent-gold)' }}>
                Collections
              </p>
              <h2 className="font-display text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Browse by category
              </h2>
            </div>
            <Link
              href="/library"
              className="hidden sm:flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {collectionsLoading
              ? Array.from({ length: 4 }).map((_, i) => <CollectionCardSkeleton key={i} />)
              : collections.slice(0, 8).map(col => (
                  <CollectionCard key={col.id} collection={col} />
                ))
            }
          </div>
        </section>

        {/* Recently Added */}
        <section className="py-24" style={{ background: 'var(--bg-secondary)' }}>
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={12} style={{ color: 'var(--accent-gold)' }} />
                  <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--accent-gold)' }}>
                    Recent
                  </p>
                </div>
                <h2 className="font-display text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Latest additions
                </h2>
              </div>
              <Link
                href="/library?sort=date-desc"
                className="hidden sm:flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
                style={{ color: 'var(--text-muted)' }}
              >
                See all new <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {assetsLoading
                ? Array.from({ length: 6 }).map((_, i) => <AssetCardSkeleton key={i} />)
                : (recentAssets.length > 0 ? recentAssets : allRecent).map(asset => (
                    <AssetCard key={asset.id} asset={asset} onPreview={setSelectedAsset} />
                  ))
              }
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="mx-auto max-w-[1600px] px-6 lg:px-10 py-24">
          <div
            className="rounded-3xl overflow-hidden relative noise-overlay"
            style={{ background: 'linear-gradient(135deg, #0d2b0d 0%, #2e8b2e 100%)' }}
          >
            <div className="px-10 py-16 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div>
                <h2
                  className="font-display text-4xl lg:text-5xl font-semibold mb-4"
                  style={{ color: '#ffffff' }}
                >
                  Need partner access?
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.65)' }} className="text-base max-w-md leading-relaxed">
                  Dispensaries and licensed partners can unlock additional assets
                  including high-res photography and exclusive marketing materials.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <Link
                  href="/library"
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-medium"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}
                >
                  Browse Public Assets
                </Link>
                <button
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-medium hover:opacity-90"
                  style={{ background: 'var(--accent-gold)', color: '#0d2b0d', fontWeight: 700 }}
                >
                  Request Access <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {selectedAsset && (
        <AssetModal
          asset={selectedAsset}
          relatedAssets={relatedAssets}
          onClose={() => setSelectedAsset(null)}
          onNavigate={setSelectedAsset}
        />
      )}

      <SearchModal
        assets={assets}
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={asset => { setSelectedAsset(asset); setSearchOpen(false) }}
      />
    </>
  )
}
