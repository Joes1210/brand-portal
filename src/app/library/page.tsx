'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Heart, AlertCircle } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AssetCard, AssetCardSkeleton } from '@/components/assets/AssetCard'
import { AssetModal } from '@/components/assets/AssetModal'
import { SearchModal } from '@/components/assets/SearchModal'
import { FilterBar } from '@/components/assets/FilterBar'
import {
  useAssets,
  useCollections,
  useFilteredAssets,
  useFavorites,
  useIntersectionObserver,
  DEFAULT_FILTERS,
  useKeyboardShortcut,
} from '@/hooks'
import type { Asset, AssetFilters } from '@/types'

const PAGE_SIZE = 24

function LibraryContent() {
  const searchParams = useSearchParams()
  const { assets, isLoading, error, source } = useAssets()
  const { collections } = useCollections()
  const { favorites } = useFavorites()

  const [filters, setFilters] = useState<AssetFilters>({
    ...DEFAULT_FILTERS,
    type: (searchParams.get('type') as AssetFilters['type']) ?? 'all',
    collection: searchParams.get('collection') ?? '',
  })
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const showFavorites = searchParams.get('favorites') === 'true'

  useKeyboardShortcut('k', () => setSearchOpen(true), { meta: true })
  useKeyboardShortcut('k', () => setSearchOpen(true), { ctrl: true })

  const filtered = useFilteredAssets(
    showFavorites ? assets.filter(a => favorites.includes(a.id)) : assets,
    filters,
  )

  const displayed = filtered.slice(0, displayCount)
  const hasMore = displayCount < filtered.length

  const loadMore = useCallback(() => {
    if (hasMore) setDisplayCount(c => c + PAGE_SIZE)
  }, [hasMore])

  const loaderRef = useIntersectionObserver(loadMore, { threshold: 0.1 })

  const handleFilterChange = useCallback((changes: Partial<AssetFilters>) => {
    setFilters(f => ({ ...f, ...changes }))
    setDisplayCount(PAGE_SIZE)
  }, [])

  const relatedAssets = selectedAsset
    ? assets.filter(a => a.id !== selectedAsset.id && a.collection === selectedAsset.collection).slice(0, 3)
    : []

  // Reset display on filter change
  useEffect(() => {
    setDisplayCount(PAGE_SIZE)
  }, [filters])

  return (
    <>
      <Navbar onSearchOpen={() => setSearchOpen(true)} />

      <main
        className="min-h-screen pt-16"
        style={{ background: 'var(--bg-primary)' }}
      >
        {/* Header */}
        <div
          className="border-b"
          style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}
        >
          <div className="mx-auto max-w-[1600px] px-6 lg:px-10 py-10">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
                  {showFavorites ? 'Saved Assets' : 'Asset Library'}
                </p>
                <h1 className="font-display text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {showFavorites ? (
                    <span className="flex items-center gap-3">
                      <Heart size={32} style={{ color: '#ef4444' }} fill="currentColor" />
                      My Favorites
                    </span>
                  ) : 'All Assets'}
                </h1>
                {source === 'mock' && (
                  <p className="mt-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    Demo mode — connect Dropbox to load real assets
                  </p>
                )}
              </div>
            </div>

            {/* Filter bar */}
            <div className="mt-8">
              <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                collections={collections}
                totalCount={assets.length}
                filteredCount={filtered.length}
                view={view}
                onViewChange={setView}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10 py-10">
          {/* Error state */}
          {error && (
            <div
              className="flex items-center gap-3 px-5 py-4 rounded-xl mb-8"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
            >
              <AlertCircle size={16} />
              <span className="text-sm">
                Failed to load assets. Showing demo data.
              </span>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className={view === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4'
              : 'flex flex-col gap-2'
            }>
              {Array.from({ length: 12 }).map((_, i) => <AssetCardSkeleton key={i} />)}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <span className="font-display text-6xl mb-6" style={{ color: 'var(--accent)', opacity: 0.3 }}>
                ✦
              </span>
              <h3 className="font-display text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                {showFavorites ? 'No favorites yet' : 'No assets found'}
              </h3>
              <p className="text-sm max-w-sm" style={{ color: 'var(--text-muted)' }}>
                {showFavorites
                  ? 'Browse the library and click ♥ to save assets here.'
                  : 'Try adjusting your filters or search query.'}
              </p>
              {!showFavorites && (
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="mt-6 px-5 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-70"
                  style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Grid / list */}
          {!isLoading && displayed.length > 0 && (
            <>
              {view === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {displayed.map(asset => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      onPreview={setSelectedAsset}
                      view="grid"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {displayed.map(asset => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      onPreview={setSelectedAsset}
                      view="list"
                    />
                  ))}
                </div>
              )}

              {/* Infinite scroll loader */}
              {hasMore && (
                <div ref={loaderRef} className="flex justify-center py-10">
                  <div className="flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
                    <div
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: 'var(--accent)', animationDelay: '0ms' }}
                    />
                    <div
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: 'var(--accent)', animationDelay: '150ms' }}
                    />
                    <div
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: 'var(--accent)', animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              )}

              {!hasMore && filtered.length > PAGE_SIZE && (
                <div className="text-center py-10">
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    — All {filtered.length} assets loaded —
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />

      {/* Modals */}
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

export default function LibraryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-4">
          <span className="font-display text-4xl" style={{ color: 'var(--accent)' }}>✦</span>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
        </div>
      </div>
    }>
      <LibraryContent />
    </Suspense>
  )
}
