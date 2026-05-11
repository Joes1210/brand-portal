import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Asset, AssetType } from '@/types'

// ── Tailwind class merge utility ──────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── File type detection ───────────────────────────────────────
export function getAssetType(extension: string): AssetType {
  const ext = extension.toLowerCase().replace('.', '')
  const map: Record<string, AssetType> = {
    png: 'image', jpg: 'image', jpeg: 'image', gif: 'image',
    webp: 'image', bmp: 'image', tiff: 'image', tif: 'image',
    svg: 'svg',
    mp4: 'video', mov: 'video', avi: 'video', webm: 'video',
    pdf: 'pdf',
    ai: 'vector', eps: 'vector', psd: 'vector',
    zip: 'archive', rar: 'archive', '7z': 'archive',
  }
  return map[ext] ?? 'unknown'
}

export function getMimeType(extension: string): string {
  const ext = extension.toLowerCase().replace('.', '')
  const map: Record<string, string> = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
    gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
    mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm',
    pdf: 'application/pdf',
    ai: 'application/postscript', eps: 'application/postscript',
    zip: 'application/zip',
  }
  return map[ext] ?? 'application/octet-stream'
}

// ── File size formatting ──────────────────────────────────────
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// ── Date utilities ────────────────────────────────────────────
export function isNewAsset(dateStr: string, daysThreshold = 7): boolean {
  const date = new Date(dateStr)
  const threshold = new Date()
  threshold.setDate(threshold.getDate() - daysThreshold)
  return date > threshold
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

// ── Asset utilities ───────────────────────────────────────────
export function getAssetDisplayName(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, '')       // remove extension
    .replace(/[-_]/g, ' ')           // dashes/underscores → spaces
    .replace(/\b\w/g, c => c.toUpperCase()) // title case
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

export function getTypeIcon(type: AssetType): string {
  const map: Record<AssetType, string> = {
    image: '🖼',
    video: '🎬',
    pdf: '📄',
    svg: '✦',
    vector: '✦',
    archive: '📦',
    unknown: '📁',
  }
  return map[type]
}

export function getTypeLabel(type: AssetType | 'all'): string {
  const map: Record<string, string> = {
    all: 'All Files',
    image: 'Images',
    video: 'Videos',
    pdf: 'PDFs',
    svg: 'SVG',
    vector: 'Vector',
    archive: 'Archives',
    unknown: 'Other',
  }
  return map[type] ?? type
}

export function isPreviewable(asset: Asset): boolean {
  return ['image', 'svg', 'video', 'pdf'].includes(asset.type)
}

// ── Search & filter ───────────────────────────────────────────
export function filterAssets(
  assets: Asset[],
  search: string,
  type: string,
  collection: string,
): Asset[] {
  return assets.filter(asset => {
    const matchesSearch =
      !search ||
      asset.displayName.toLowerCase().includes(search.toLowerCase()) ||
      asset.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
      asset.collection.toLowerCase().includes(search.toLowerCase())

    const matchesType = type === 'all' || asset.type === type
    const matchesCollection = !collection || asset.collectionPath === collection

    return matchesSearch && matchesType && matchesCollection
  })
}

export function sortAssets(
  assets: Asset[],
  sortBy: string,
  sortOrder: 'asc' | 'desc',
): Asset[] {
  return [...assets].sort((a, b) => {
    let cmp = 0
    switch (sortBy) {
      case 'name':
        cmp = a.displayName.localeCompare(b.displayName)
        break
      case 'date':
        cmp = new Date(a.modified).getTime() - new Date(b.modified).getTime()
        break
      case 'size':
        cmp = a.size - b.size
        break
      case 'type':
        cmp = a.type.localeCompare(b.type)
        break
    }
    return sortOrder === 'asc' ? cmp : -cmp
  })
}

// ── Clipboard ─────────────────────────────────────────────────
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// ── Local storage (favorites) ─────────────────────────────────
const FAVORITES_KEY = 'brand-portal-favorites'

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function toggleFavorite(assetId: string): boolean {
  const favs = getFavorites()
  const idx = favs.indexOf(assetId)
  if (idx > -1) {
    favs.splice(idx, 1)
  } else {
    favs.push(assetId)
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
  return idx === -1 // returns true if newly added
}

export function isFavorite(assetId: string): boolean {
  return getFavorites().includes(assetId)
}

// ── Download tracking hook ─────────────────────────────────────
const DOWNLOADS_KEY = 'brand-portal-downloads'

export function trackDownload(assetId: string, assetName: string): void {
  if (typeof window === 'undefined') return
  try {
    const downloads = JSON.parse(localStorage.getItem(DOWNLOADS_KEY) ?? '[]')
    downloads.push({ assetId, assetName, timestamp: new Date().toISOString() })
    // Keep last 100
    if (downloads.length > 100) downloads.shift()
    localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads))
    // Future: send to analytics API
    // analyticsEvent('asset_download', { assetId, assetName })
  } catch {
    // silently fail
  }
}
