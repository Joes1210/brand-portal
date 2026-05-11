'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import useSWR from 'swr'
import type { Asset, Collection, AssetFilters } from '@/types'
import { filterAssets, sortAssets, getFavorites, toggleFavorite, isFavorite, trackDownload } from '@/lib/utils'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then(r => r.json())

// ── Assets hook ───────────────────────────────────────────────
export function useAssets() {
  const { data, error, isLoading, mutate } = useSWR('/api/assets', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  return {
    assets: (data?.assets ?? []) as Asset[],
    isLoading,
    error,
    source: data?.source,
    refresh: mutate,
  }
}

// ── Collections hook ──────────────────────────────────────────
export function useCollections() {
  const { data, error, isLoading } = useSWR('/api/collections', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  return {
    collections: (data?.collections ?? []) as Collection[],
    isLoading,
    error,
  }
}

// ── Filtered assets hook ──────────────────────────────────────
export function useFilteredAssets(assets: Asset[], filters: AssetFilters) {
  return sortAssets(
    filterAssets(assets, filters.search, filters.type, filters.collection),
    filters.sortBy,
    filters.sortOrder,
  )
}

// ── Default filters ───────────────────────────────────────────
export const DEFAULT_FILTERS: AssetFilters = {
  search: '',
  type: 'all',
  collection: '',
  sortBy: 'date',
  sortOrder: 'desc',
  access: 'all',
}

// ── Favorites hook ────────────────────────────────────────────
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    setFavorites(getFavorites())
  }, [])

  const toggle = useCallback((assetId: string) => {
    const added = toggleFavorite(assetId)
    setFavorites(getFavorites())
    toast(added ? '♥ Added to favorites' : 'Removed from favorites', {
      style: {
        background: '#2d1d11',
        color: '#e8ddd0',
        border: '1px solid #5a3a23',
      },
    })
    return added
  }, [])

  const check = useCallback((assetId: string) => favorites.includes(assetId), [favorites])

  return { favorites, toggle, isFavorite: check }
}

// ── Download hook ─────────────────────────────────────────────
export function useDownload() {
  const [downloading, setDownloading] = useState<string | null>(null)

  const download = useCallback(async (asset: Asset) => {
    if (downloading) return
    setDownloading(asset.id)

    try {
      const res = await fetch(`/api/download?path=${encodeURIComponent(asset.path)}&id=${asset.id}`)
      const data = await res.json()

      if (data.error) throw new Error(data.error)

      // Track download
      trackDownload(asset.id, asset.name)

      if (data.mock) {
        toast('Demo mode — connect Dropbox for real downloads', {
          icon: 'ℹ️',
          style: { background: '#2d1d11', color: '#e8ddd0', border: '1px solid #5a3a23' },
        })
        return
      }

      // Trigger browser download
      const link = document.createElement('a')
      link.href = data.url
      link.download = asset.name
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`Downloading ${asset.displayName}`, {
        style: { background: '#2d1d11', color: '#e8ddd0', border: '1px solid #5a3a23' },
      })
    } catch (err) {
      console.error('Download error:', err)
      toast.error('Download failed — please try again', {
        style: { background: '#2d1d11', color: '#e8ddd0', border: '1px solid #5a3a23' },
      })
    } finally {
      setDownloading(null)
    }
  }, [downloading])

  return { download, downloading }
}

// ── Intersection observer for infinite scroll ─────────────────
export function useIntersectionObserver(
  callback: () => void,
  options?: IntersectionObserverInit,
) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) callback()
    }, options)

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [callback, options])

  return ref
}

// ── Keyboard shortcut hook ─────────────────────────────────────
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers: { ctrl?: boolean; meta?: boolean; shift?: boolean } = {},
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const matchKey = e.key === key
      const matchCtrl = !modifiers.ctrl || e.ctrlKey
      const matchMeta = !modifiers.meta || e.metaKey
      const matchShift = !modifiers.shift || e.shiftKey
      if (matchKey && matchCtrl && matchMeta && matchShift) {
        e.preventDefault()
        callback()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [key, callback, modifiers])
}

// ── Search debounce ───────────────────────────────────────────
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
