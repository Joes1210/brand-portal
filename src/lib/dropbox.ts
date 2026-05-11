import type { Asset, Collection, DropboxFolderEntry } from '@/types'
import {
  getAssetType,
  getMimeType,
  formatFileSize,
  getAssetDisplayName,
  getFileExtension,
  isNewAsset,
} from '@/lib/utils'

// ── Dropbox API client ────────────────────────────────────────
// Uses the Dropbox HTTP API v2 directly for maximum control.
// Set DROPBOX_ACCESS_TOKEN in your .env.local

const DROPBOX_API = 'https://api.dropboxapi.com/2'
const DROPBOX_CONTENT = 'https://content.dropboxapi.com/2'

function dbxHeaders(extra?: Record<string, string>) {
  return {
    Authorization: `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    ...extra,
  }
}

// ── List folder contents ──────────────────────────────────────
export async function listDropboxFolder(
  path: string = '',
): Promise<DropboxFolderEntry[]> {
  const entries: DropboxFolderEntry[] = []
  let cursor: string | null = null
  let hasMore = true

  while (hasMore) {
    const url = cursor
      ? `${DROPBOX_API}/files/list_folder/continue`
      : `${DROPBOX_API}/files/list_folder`

    const body = cursor
      ? { cursor }
      : {
          path: path || '',
          recursive: false,
          include_media_info: true,
          include_deleted: false,
          include_has_explicit_shared_members: false,
        }

    const res = await fetch(url, {
      method: 'POST',
      headers: dbxHeaders(),
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[Dropbox] list_folder error:', err)
      throw new Error(`Dropbox API error: ${res.status}`)
    }

    const data = await res.json()
    entries.push(...data.entries)
    hasMore = data.has_more
    cursor = data.cursor
  }

  return entries
}

// ── Get temporary download link ───────────────────────────────
export async function getTemporaryLink(path: string): Promise<string> {
  const res = await fetch(`${DROPBOX_API}/files/get_temporary_link`, {
    method: 'POST',
    headers: dbxHeaders(),
    body: JSON.stringify({ path }),
  })
  if (!res.ok) throw new Error('Failed to get temporary link')
  const data = await res.json()
  return data.link
}

// ── Get thumbnail ─────────────────────────────────────────────
export async function getDropboxThumbnailUrl(path: string, size = 'w256h256'): Promise<string | undefined> {
  // Only images support thumbnails in Dropbox API
  const ext = getFileExtension(path)
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp']
  if (!imageExts.includes(ext)) return undefined

  try {
    const res = await fetch(`${DROPBOX_CONTENT}/files/get_thumbnail_v2`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
        'Dropbox-API-Arg': JSON.stringify({
          resource: { '.tag': 'path', path },
          format: { '.tag': 'jpeg' },
          size: { '.tag': size },
          mode: { '.tag': 'fitone_bestfit' },
        }),
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })

    if (!res.ok) return undefined
    const buffer = await res.arrayBuffer()
    const b64 = Buffer.from(buffer).toString('base64')
    return `data:image/jpeg;base64,${b64}`
  } catch {
    return undefined
  }
}

// ── Build shared link ─────────────────────────────────────────
export async function createSharedLink(path: string): Promise<string | undefined> {
  try {
    const res = await fetch(`${DROPBOX_API}/sharing/create_shared_link_with_settings`, {
      method: 'POST',
      headers: dbxHeaders(),
      body: JSON.stringify({
        path,
        settings: {
          requested_visibility: { '.tag': 'public' },
          audience: { '.tag': 'public' },
          access: { '.tag': 'viewer' },
        },
      }),
    })
    if (!res.ok) {
      // If link already exists, fetch it
      const existing = await fetch(`${DROPBOX_API}/sharing/list_shared_links`, {
        method: 'POST',
        headers: dbxHeaders(),
        body: JSON.stringify({ path, direct_only: true }),
      })
      if (existing.ok) {
        const d = await existing.json()
        return d.links?.[0]?.url?.replace('?dl=0', '?dl=1')
      }
      return undefined
    }
    const d = await res.json()
    return d.url?.replace('?dl=0', '?dl=1')
  } catch {
    return undefined
  }
}

// ── Transform entry to Asset ──────────────────────────────────
export function entryToAsset(
  entry: DropboxFolderEntry & { server_modified?: string; size?: number },
  collectionPath: string,
  collectionName: string,
): Asset | null {
  if (entry['.tag'] !== 'file') return null

  const ext = getFileExtension(entry.name)
  const type = getAssetType(ext)
  const modified = entry.server_modified ?? entry.client_modified ?? new Date().toISOString()
  const size = entry.size ?? 0

  return {
    id: entry.id,
    name: entry.name,
    displayName: getAssetDisplayName(entry.name),
    path: entry.path_display,
    type,
    extension: ext,
    size,
    sizeFormatted: formatFileSize(size),
    modified,
    dropboxId: entry.id,
    tags: inferTags(entry.name, collectionName),
    collection: collectionName,
    collectionPath,
    isNew: isNewAsset(modified),
    access: 'public', // default; expand with auth rules later
    mimeType: getMimeType(ext),
  }
}

// ── Infer tags from filename + folder ────────────────────────
function inferTags(filename: string, collection: string): string[] {
  const tags: string[] = []
  const nameLower = filename.toLowerCase()

  // Collection as tag
  if (collection) tags.push(collection.toLowerCase())

  // Common brand asset keywords
  const keywords = [
    'logo', 'icon', 'banner', 'social', 'print', 'web', 'dark', 'light',
    'horizontal', 'vertical', 'full', 'square', 'template', 'brand',
    'color', 'typography', 'guide', 'lockup', 'wordmark',
  ]
  keywords.forEach(kw => {
    if (nameLower.includes(kw)) tags.push(kw)
  })

  return [...new Set(tags)]
}

// ── Recursively build collections ─────────────────────────────
export async function buildCollections(rootPath = ''): Promise<Collection[]> {
  const entries = await listDropboxFolder(rootPath)
  const folders = entries.filter(e => e['.tag'] === 'folder')

  const collections: Collection[] = await Promise.all(
    folders.map(async (folder): Promise<Collection> => {
      const subEntries = await listDropboxFolder(folder.path_display)
      const files = subEntries.filter(e => e['.tag'] === 'file')
      const subFolders = subEntries.filter(e => e['.tag'] === 'folder')

      const assets = files
        .map(f => entryToAsset(f as DropboxFolderEntry, folder.path_display, folder.name))
        .filter((a): a is Asset => a !== null)

      // Nested collections (one level deep for perf)
      const subCollections: Collection[] = subFolders.map(sf => ({
        id: sf.id,
        name: sf.name,
        path: sf.path_display,
        assetCount: 0, // lazy-loaded
        access: 'public' as const,
        lastModified: new Date().toISOString(),
      }))

      // Use first image as cover
      const coverAsset = assets.find(a => a.type === 'image' || a.type === 'svg')

      return {
        id: folder.id,
        name: folder.name,
        path: folder.path_display,
        assetCount: files.length,
        coverAsset,
        subCollections,
        access: 'public',
        lastModified: new Date().toISOString(),
      }
    })
  )

  return collections
}

// ── Fetch all assets from all folders ─────────────────────────
export async function fetchAllAssets(rootPath = ''): Promise<Asset[]> {
  const entries = await listDropboxFolder(rootPath)
  const allAssets: Asset[] = []

  // Root-level files
  const rootFiles = entries.filter(e => e['.tag'] === 'file')
  rootFiles.forEach(f => {
    const asset = entryToAsset(f as DropboxFolderEntry, rootPath, 'General')
    if (asset) allAssets.push(asset)
  })

  // Folder files
  const folders = entries.filter(e => e['.tag'] === 'folder')
  for (const folder of folders) {
    const folderEntries = await listDropboxFolder(folder.path_display)
    const folderFiles = folderEntries.filter(e => e['.tag'] === 'file')
    folderFiles.forEach(f => {
      const asset = entryToAsset(
        f as DropboxFolderEntry,
        folder.path_display,
        folder.name,
      )
      if (asset) allAssets.push(asset)
    })
  }

  return allAssets.sort(
    (a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime()
  )
}
