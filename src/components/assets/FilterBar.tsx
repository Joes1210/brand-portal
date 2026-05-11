'use client'

import { useState } from 'react'
import { SlidersHorizontal, Grid, List, ArrowUpDown, ChevronDown } from 'lucide-react'
import type { AssetFilters, Collection } from '@/types'
import { cn, getTypeLabel } from '@/lib/utils'

const ASSET_TYPES = ['all', 'image', 'video', 'pdf', 'svg', 'vector', 'archive'] as const

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest first' },
  { value: 'date-asc', label: 'Oldest first' },
  { value: 'name-asc', label: 'A → Z' },
  { value: 'name-desc', label: 'Z → A' },
  { value: 'size-desc', label: 'Largest first' },
  { value: 'size-asc', label: 'Smallest first' },
]

interface FilterBarProps {
  filters: AssetFilters
  onFilterChange: (filters: Partial<AssetFilters>) => void
  collections: Collection[]
  totalCount: number
  filteredCount: number
  view: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
}

export function FilterBar({
  filters,
  onFilterChange,
  collections,
  totalCount,
  filteredCount,
  view,
  onViewChange,
}: FilterBarProps) {
  const [showCollectionMenu, setShowCollectionMenu] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)

  const currentSort = `${filters.sortBy}-${filters.sortOrder}`
  const currentSortLabel = SORT_OPTIONS.find(s => s.value === currentSort)?.label ?? 'Sort'
  const currentCollection = collections.find(c => c.path === filters.collection)

  const handleSort = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [AssetFilters['sortBy'], AssetFilters['sortOrder']]
    onFilterChange({ sortBy, sortOrder })
    setShowSortMenu(false)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Type pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {ASSET_TYPES.map(type => (
          <button
            key={type}
            onClick={() => onFilterChange({ type })}
            className={cn(
              'shrink-0 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase transition-all duration-200',
            )}
            style={{
              background: filters.type === type ? 'var(--accent)' : 'var(--bg-secondary)',
              color: filters.type === type ? 'var(--bg-primary)' : 'var(--text-muted)',
              border: '1px solid',
              borderColor: filters.type === type ? 'var(--accent)' : 'var(--border-color)',
            }}
          >
            {getTypeLabel(type)}
          </button>
        ))}
      </div>

      {/* Second row: collection, sort, view, count */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Collection filter */}
          <div className="relative">
            <button
              onClick={() => setShowCollectionMenu(!showCollectionMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors duration-200"
              style={{
                background: filters.collection ? 'var(--accent)' : 'var(--bg-secondary)',
                color: filters.collection ? 'var(--bg-primary)' : 'var(--text-muted)',
                border: '1px solid var(--border-color)',
              }}
            >
              <SlidersHorizontal size={12} />
              {currentCollection?.name ?? 'All Collections'}
              <ChevronDown size={12} />
            </button>

            {showCollectionMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowCollectionMenu(false)}
                />
                <div
                  className="absolute top-full left-0 mt-2 z-20 rounded-xl overflow-hidden shadow-xl w-56"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <button
                    onClick={() => { onFilterChange({ collection: '' }); setShowCollectionMenu(false) }}
                    className="w-full flex items-center px-4 py-2.5 text-xs hover:opacity-70 transition-opacity text-left"
                    style={{ color: !filters.collection ? 'var(--accent)' : 'var(--text-primary)' }}
                  >
                    All Collections
                  </button>
                  {collections.map(col => (
                    <button
                      key={col.path}
                      onClick={() => { onFilterChange({ collection: col.path }); setShowCollectionMenu(false) }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-xs hover:opacity-70 transition-opacity text-left"
                      style={{
                        color: filters.collection === col.path ? 'var(--accent)' : 'var(--text-primary)',
                        borderTop: '1px solid var(--border-color)',
                      }}
                    >
                      <span>{col.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{col.assetCount}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors duration-200"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-color)',
              }}
            >
              <ArrowUpDown size={12} />
              {currentSortLabel}
              <ChevronDown size={12} />
            </button>

            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                <div
                  className="absolute top-full left-0 mt-2 z-20 rounded-xl overflow-hidden shadow-xl w-44"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                  {SORT_OPTIONS.map((opt, i) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSort(opt.value)}
                      className="w-full px-4 py-2.5 text-xs hover:opacity-70 transition-opacity text-left"
                      style={{
                        color: currentSort === opt.value ? 'var(--accent)' : 'var(--text-primary)',
                        borderTop: i > 0 ? '1px solid var(--border-color)' : 'none',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Active filter tags */}
          {filters.collection && (
            <button
              onClick={() => onFilterChange({ collection: '' })}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors duration-200"
              style={{ background: 'var(--bg-secondary)', color: 'var(--accent)', border: '1px solid var(--accent)' }}
            >
              ✕ {currentCollection?.name}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Count */}
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            {filteredCount === totalCount
              ? `${totalCount} assets`
              : `${filteredCount} of ${totalCount}`}
          </span>

          {/* View toggle */}
          <div
            className="flex items-center rounded-lg overflow-hidden"
            style={{ border: '1px solid var(--border-color)' }}
          >
            <button
              onClick={() => onViewChange('grid')}
              className="p-2 transition-colors duration-200"
              style={{
                background: view === 'grid' ? 'var(--accent)' : 'var(--bg-secondary)',
                color: view === 'grid' ? 'var(--bg-primary)' : 'var(--text-muted)',
              }}
              aria-label="Grid view"
            >
              <Grid size={13} />
            </button>
            <button
              onClick={() => onViewChange('list')}
              className="p-2 transition-colors duration-200"
              style={{
                background: view === 'list' ? 'var(--accent)' : 'var(--bg-secondary)',
                color: view === 'list' ? 'var(--bg-primary)' : 'var(--text-muted)',
              }}
              aria-label="List view"
            >
              <List size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
