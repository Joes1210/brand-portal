import Link from 'next/link'
import Image from 'next/image'
import type { Collection } from '@/types'
import { formatDate } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

interface CollectionCardProps {
  collection: Collection
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link
      href={`/library?collection=${encodeURIComponent(collection.path)}`}
      className="group block rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Cover image */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: '16/9', background: 'var(--bg-secondary)' }}
      >
        {collection.coverAsset?.thumbnailUrl ? (
          <Image
            src={collection.coverAsset.thumbnailUrl}
            alt={collection.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-5xl" style={{ color: 'var(--accent)', opacity: 0.3 }}>
              ✦
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'linear-gradient(to top, rgba(12,10,9,0.8) 0%, transparent 60%)' }}
        />

        {/* Asset count badge */}
        <div
          className="absolute top-3 right-3 text-xs font-mono px-2.5 py-1 rounded-full"
          style={{
            background: 'rgba(12, 10, 9, 0.7)',
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          {collection.assetCount} files
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3
              className="font-display text-lg font-semibold mb-1 group-hover:text-opacity-80 transition-colors"
              style={{ color: 'var(--text-primary)' }}
            >
              {collection.name}
            </h3>
            {collection.description && (
              <p
                className="text-xs leading-relaxed line-clamp-2"
                style={{ color: 'var(--text-muted)' }}
              >
                {collection.description}
              </p>
            )}
          </div>
          <ArrowRight
            size={16}
            className="shrink-0 mt-1 transition-transform duration-300 group-hover:translate-x-1"
            style={{ color: 'var(--accent)' }}
          />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span
            className="text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            Updated {formatDate(collection.lastModified)}
          </span>
        </div>
      </div>
    </Link>
  )
}

export function CollectionCardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
    >
      <div className="skeleton" style={{ aspectRatio: '16/9' }} />
      <div className="p-5 space-y-2">
        <div className="skeleton h-5 rounded w-2/3" />
        <div className="skeleton h-3 rounded w-full" />
        <div className="skeleton h-3 rounded w-3/4" />
      </div>
    </div>
  )
}
