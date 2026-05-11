'use client'

import { useEffect, useCallback, useState } from 'react'
import Image from 'next/image'
import {
  X, Download, Heart, Link2, Copy, Check, FileText,
  Film, Package, Star, Calendar, HardDrive, Tag, Folder, ExternalLink,
} from 'lucide-react'
import type { Asset } from '@/types'
import { cn, formatDate, copyToClipboard } from '@/lib/utils'
import { useFavorites, useDownload } from '@/hooks'
import { useKeyboardShortcut } from '@/hooks'

interface AssetModalProps {
  asset: Asset | null
  relatedAssets: Asset[]
  onClose: () => void
  onNavigate: (asset: Asset) => void
}

export function AssetModal({ asset, relatedAssets, onClose, onNavigate }: AssetModalProps) {
  const [copied, setCopied] = useState(false)
  const { toggle, isFavorite } = useFavorites()
  const { download, downloading } = useDownload()

  useKeyboardShortcut('Escape', onClose)

  const handleCopyLink = useCallback(async () => {
    if (!asset) return
    const url = `${window.location.origin}/library?asset=${asset.id}`
    await copyToClipboard(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [asset])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!asset) return null

  const faved = isFavorite(asset.id)

  const renderPreview = () => {
    if (asset.type === 'image' || asset.type === 'svg') {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {asset.thumbnailUrl ? (
            <Image
              src={asset.thumbnailUrl}
              alt={asset.displayName}
              fill
              className="object-contain"
              unoptimized
            />
          ) : (
            <div className="flex flex-col items-center gap-4" style={{ color: 'var(--accent)' }}>
              <span className="text-7xl">✦</span>
              <span className="text-xs font-mono uppercase" style={{ color: 'var(--text-muted)' }}>
                {asset.extension}
              </span>
            </div>
          )}
        </div>
      )
    }

    if (asset.type === 'video') {
      return (
        <div className="flex flex-col items-center justify-center gap-4 h-full">
          <Film size={56} strokeWidth={1} style={{ color: 'var(--accent)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Download to play video
          </p>
        </div>
      )
    }

    if (asset.type === 'pdf') {
      return (
        <div className="flex flex-col items-center justify-center gap-4 h-full">
          <FileText size={56} strokeWidth={1} style={{ color: 'var(--accent)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            PDF Document
          </p>
        </div>
      )
    }

    if (asset.type === 'archive') {
      return (
        <div className="flex flex-col items-center justify-center gap-4 h-full">
          <Package size={56} strokeWidth={1} style={{ color: 'var(--accent)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Archive Package
          </p>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center gap-4 h-full">
        <span className="text-5xl" style={{ color: 'var(--accent)' }}>✦</span>
        <p className="text-sm uppercase font-mono" style={{ color: 'var(--text-muted)' }}>
          {asset.extension}
        </p>
      </div>
    )
  }

  const meta = [
    { icon: HardDrive, label: 'Size', value: asset.sizeFormatted },
    { icon: Calendar, label: 'Added', value: formatDate(asset.modified) },
    { icon: Folder, label: 'Collection', value: asset.collection },
    ...(asset.width && asset.height
      ? [{ icon: ExternalLink, label: 'Dimensions', value: `${asset.width} × ${asset.height}` }]
      : []),
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(12, 10, 9, 0.9)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
      aria-modal="true"
      role="dialog"
      aria-label={`Asset detail: ${asset.displayName}`}
    >
      <div
        className="relative w-full sm:max-w-5xl max-h-[95vh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col lg:flex-row"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl transition-colors duration-200"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Preview pane */}
        <div
          className="lg:flex-1 relative"
          style={{
            background: 'var(--bg-secondary)',
            minHeight: 280,
            maxHeight: 400,
          }}
        >
          <div className="absolute inset-0">
            {renderPreview()}
          </div>
          {asset.isNew && (
            <div className="absolute top-4 left-4">
              <span className="badge-new">New</span>
            </div>
          )}
        </div>

        {/* Info pane */}
        <div className="w-full lg:w-80 xl:w-96 flex flex-col overflow-y-auto">
          <div className="p-6 flex-1">
            {/* Header */}
            <div className="mb-6">
              <div
                className="inline-block text-xs font-mono uppercase tracking-widest px-2 py-1 rounded mb-3"
                style={{ background: 'var(--bg-secondary)', color: 'var(--accent)' }}
              >
                {asset.extension}
              </div>
              <h2
                className="font-display text-2xl font-semibold leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {asset.displayName}
              </h2>
            </div>

            {/* Metadata */}
            <div
              className="rounded-xl overflow-hidden mb-6"
              style={{ border: '1px solid var(--border-color)' }}
            >
              {meta.map(({ icon: Icon, label, value }, i) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-4 py-3"
                  style={{
                    borderTop: i > 0 ? `1px solid var(--border-color)` : 'none',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={13} style={{ color: 'var(--accent)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {label}
                    </span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Tags */}
            {asset.tags.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={12} style={{ color: 'var(--accent)' }} />
                  <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Tags
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {asset.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Access level stub */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg mb-6"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: asset.access === 'public' ? '#4ade80' : '#f59e0b' }}
              />
              <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                {asset.access} access
              </span>
            </div>
          </div>

          {/* Actions */}
          <div
            className="p-6 pt-0 flex flex-col gap-3"
          >
            <button
              onClick={() => download(asset)}
              disabled={downloading === asset.id}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
            >
              <Download size={15} />
              {downloading === asset.id ? 'Preparing…' : `Download ${asset.extension.toUpperCase()}`}
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => toggle(asset.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200"
                style={{
                  background: 'var(--bg-secondary)',
                  color: faved ? '#ef4444' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <Heart size={13} fill={faved ? 'currentColor' : 'none'} />
                {faved ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Related assets */}
          {relatedAssets.length > 0 && (
            <div
              className="px-6 pb-6 pt-0"
              style={{ borderTop: '1px solid var(--border-color)' }}
            >
              <p
                className="text-xs font-mono uppercase tracking-wider mb-3 pt-4"
                style={{ color: 'var(--text-muted)' }}
              >
                Related
              </p>
              <div className="flex flex-col gap-2">
                {relatedAssets.slice(0, 3).map(related => (
                  <button
                    key={related.id}
                    onClick={() => onNavigate(related)}
                    className="flex items-center gap-3 p-2 rounded-lg transition-colors duration-200 text-left"
                    style={{ background: 'var(--bg-secondary)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg shrink-0 overflow-hidden flex items-center justify-center"
                      style={{ background: 'var(--bg-card)' }}
                    >
                      {related.thumbnailUrl ? (
                        <Image
                          src={related.thumbnailUrl}
                          alt={related.displayName}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span style={{ color: 'var(--accent)', fontSize: 14 }}>✦</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-xs font-medium truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {related.displayName}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {related.sizeFormatted}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
