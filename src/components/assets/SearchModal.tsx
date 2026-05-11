'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Search, X, ArrowRight, Clock } from 'lucide-react'
import type { Asset } from '@/types'
import { useDebounce, useKeyboardShortcut } from '@/hooks'
import { filterAssets } from '@/lib/utils'

interface SearchModalProps {
  assets: Asset[]
  isOpen: boolean
  onClose: () => void
  onSelect: (asset: Asset) => void
}

const RECENT_KEY = 'brand-portal-recent-searches'

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') }
  catch { return [] }
}

function addRecentSearch(query: string) {
  const recent = getRecentSearches().filter(r => r !== query)
  recent.unshift(query)
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 8)))
}

export function SearchModal({ assets, isOpen, onClose, onSelect }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(query, 200)

  useKeyboardShortcut('Escape', onClose)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIdx(0)
      setRecentSearches(getRecentSearches())
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const results = debouncedQuery.length >= 2
    ? filterAssets(assets, debouncedQuery, 'all', '').slice(0, 8)
    : []

  const handleSelect = useCallback((asset: Asset) => {
    addRecentSearch(query)
    setRecentSearches(getRecentSearches())
    onSelect(asset)
    onClose()
  }, [query, onSelect, onClose])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      handleSelect(results[selectedIdx])
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
      style={{ background: 'rgba(12, 10, 9, 0.85)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        {/* Input */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIdx(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Search assets, collections, tags…"
            className="flex-1 bg-transparent text-base outline-none placeholder:text-opacity-50"
            style={{ color: 'var(--text-primary)' }}
            aria-label="Search assets"
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ color: 'var(--text-muted)' }}>
              <X size={15} />
            </button>
          )}
          <kbd
            className="hidden sm:block text-xs px-2 py-1 rounded font-mono"
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-color)',
            }}
          >
            esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {results.length > 0 && (
            <div className="p-2">
              <p
                className="text-xs font-mono uppercase tracking-wider px-3 py-2"
                style={{ color: 'var(--text-muted)' }}
              >
                {results.length} results
              </p>
              {results.map((asset, idx) => (
                <button
                  key={asset.id}
                  onClick={() => handleSelect(asset)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 text-left"
                  style={{
                    background: idx === selectedIdx ? 'var(--bg-secondary)' : 'transparent',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg shrink-0 overflow-hidden flex items-center justify-center"
                    style={{ background: 'var(--bg-secondary)' }}
                  >
                    {asset.thumbnailUrl ? (
                      <Image
                        src={asset.thumbnailUrl}
                        alt=""
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span style={{ color: 'var(--accent)' }}>✦</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {asset.displayName}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {asset.collection} · {asset.extension.toUpperCase()} · {asset.sizeFormatted}
                    </p>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                </button>
              ))}
            </div>
          )}

          {debouncedQuery.length >= 2 && results.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No assets found for &ldquo;{debouncedQuery}&rdquo;
              </p>
            </div>
          )}

          {!debouncedQuery && recentSearches.length > 0 && (
            <div className="p-2">
              <p
                className="text-xs font-mono uppercase tracking-wider px-3 py-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Recent searches
              </p>
              {recentSearches.map(s => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors duration-150 text-left hover:opacity-70"
                >
                  <Clock size={13} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s}</span>
                </button>
              ))}
            </div>
          )}

          {!debouncedQuery && (
            <div className="px-5 pb-4 pt-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Type at least 2 characters to search — or press{' '}
                <kbd className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>↑↓</kbd>{' '}
                to navigate,{' '}
                <kbd className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>↵</kbd>{' '}
                to select
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
