'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Download, Heart, Eye, FileText, Film, Package, Star } from 'lucide-react'
import type { Asset } from '@/types'
import { cn, getTypeLabel, formatDate } from '@/lib/utils'
import { useFavorites, useDownload } from '@/hooks'

interface AssetCardProps {
  asset: Asset
  onPreview: (asset: Asset) => void
  view?: 'grid' | 'list'
}

const TYPE_ICONS = {
  image: null,  // use thumbnail
  video: Film,
  pdf: FileText,
  svg: null,
  vector: Star,
  archive: Package,
  unknown: FileText,
}

export function AssetCard({ asset, onPreview, view = 'grid' }: AssetCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const { toggle, isFavorite } = useFavorites()
  const { download, downloading } = useDownload()
  const faved = isFavorite(asset.id)

  const handleDownload = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      download(asset)
    },
    [asset, download],
  )

  const handleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      toggle(asset.id)
    },
    [asset.id, toggle],
  )

  const TypeIcon = TYPE_ICONS[asset.type]

  if (view === 'list') {
    return (
      <div
        onClick={() => onPreview(asset)}
        className="flex items-center gap-4 px-5 py-3 rounded-xl cursor-pointer transition-all duration-300 group"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        role="button"
        tabIndex={0}
        aria-label={`Preview ${asset.displayName}`}
        onKeyDown={e => e.key === 'Enter' && onPreview(asset)}
      >
        {/* Thumbnail */}
        <div
          className="w-12 h-12 rounded-lg shrink-0 overflow-hidden flex items-center justify-center"
          style={{ background: 'var(--bg-secondary)' }}
        >
          {asset.thumbnailUrl ? (
            <Image
              src={asset.thumbnailUrl}
              alt={asset.displayName}
              width={48}
              height={48}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <span style={{ color: 'var(--accent)' }}>
              {TypeIcon ? <TypeIcon size={20} /> : '✦'}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-sm font-medium truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {asset.displayName}
            </span>
            {asset.isNew && <span className="badge-new shrink-0">New</span>}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase" style={{ color: 'var(--text-muted)' }}>
              {asset.extension}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {asset.sizeFormatted}
            </span>
            <span className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>
              {asset.collection}
            </span>
          </div>
        </div>

        <span className="text-xs hidden md:block shrink-0" style={{ color: 'var(--text-muted)' }}>
          {formatDate(asset.modified)}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleFavorite}
            className="p-2 rounded-lg transition-colors"
            style={{ color: faved ? 'var(--accent)' : 'var(--text-muted)' }}
            aria-label="Toggle favorite"
          >
            <Heart size={14} fill={faved ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Download"
            disabled={downloading === asset.id}
          >
            <Download size={14} />
          </button>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div
      onClick={() => onPreview(asset)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: hovered ? 'var(--shadow-hover)' : 'var(--shadow-card)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      role="button"
      tabIndex={0}
      aria-label={`Preview ${asset.displayName}`}
      onKeyDown={e => e.key === 'Enter' && onPreview(asset)}
    >
      {/* Thumbnail area */}
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: asset.type === 'video' ? '16/9' : '4/3',
          background: 'var(--bg-secondary)',
        }}
      >
        {asset.thumbnailUrl ? (
          <>
            {!imgLoaded && <div className="absolute inset-0 skeleton" />}
            <Image
              src={asset.thumbnailUrl}
              alt={asset.displayName}
              fill
              className={cn(
                'object-cover transition-all duration-700',
                imgLoaded ? 'opacity-100' : 'opacity-0',
                hovered ? 'scale-105' : 'scale-100',
              )}
              onLoad={() => setImgLoaded(true)}
              unoptimized
            />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span style={{ color: 'var(--accent)', fontSize: 36 }}>
              {TypeIcon ? <TypeIcon size={36} strokeWidth={1} /> : '✦'}
            </span>
            <span
              className="text-xs font-mono uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              {asset.extension}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center gap-3 transition-all duration-300',
          )}
          style={{
            background: 'rgba(12, 10, 9, 0.6)',
            opacity: hovered ? 1 : 0,
            backdropFilter: hovered ? 'blur(2px)' : 'none',
          }}
        >
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition-transform duration-200 hover:scale-105"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            onClick={e => { e.stopPropagation(); onPreview(asset) }}
          >
            <Eye size={13} />
            Preview
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading === asset.id}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition-transform duration-200 hover:scale-105"
            style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
          >
            <Download size={13} />
            {downloading === asset.id ? '…' : 'Download'}
          </button>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {asset.isNew && <span className="badge-new">New</span>}
        </div>

        {/* Favorite */}
        <button
          onClick={handleFavorite}
          className={cn(
            'absolute top-3 right-3 p-1.5 rounded-lg transition-all duration-200',
            hovered || faved ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            background: 'rgba(12, 10, 9, 0.6)',
            color: faved ? '#ef4444' : '#ffffff',
          }}
          aria-label="Toggle favorite"
        >
          <Heart size={13} fill={faved ? 'currentColor' : 'none'} />
        </button>

        {/* Type badge */}
        <div
          className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-xs font-mono uppercase tracking-wider"
          style={{
            background: 'rgba(12, 10, 9, 0.7)',
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          {asset.extension}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3
          className="text-sm font-medium truncate mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {asset.displayName}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {asset.collection}
          </span>
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            {asset.sizeFormatted}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Skeleton card ─────────────────────────────────────────────
export function AssetCardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="skeleton" style={{ aspectRatio: '4/3' }} />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 rounded-lg w-3/4" />
        <div className="skeleton h-3 rounded-lg w-1/2" />
      </div>
    </div>
  )
}
