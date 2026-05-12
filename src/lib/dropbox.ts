import type { Asset, Collection, DropboxFolderEntry } from '@/types'
import {
  getAssetType,
  getMimeType,
  formatFileSize,
  getAssetDisplayName,
  getFileExtension,
  isNewAsset,
} from '@/lib/utils'

const DROPBOX_API = 'https://api.dropboxapi.com/2'
const DROPBOX_CONTENT = 'https://content.dropboxapi.com/2'

function dbxHeaders(extra?: Record<string, string>) {
  return {
    Authorization: `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    ...extra,
  }
}

export async function listDropboxFolder(path: string = ''): Promise<DropboxFolderEntry[]> {
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

async function getThumbnailBase64(path: string): Promise<string | undefined> {
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
          size: { '.tag': 'w256h256' },
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
    access: 'public',
    mimeType: getMimeType(ext),
  }
}

function inferTags(filename: string, collection: string): string[] {
  const tags: string[] = []
  const nameLower = filename.toLowerCase()
  if (collection) tags.push(collection.toLowerCase())
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

export async function buildCollections(rootPath = ''): Promise<Collection[]> {
  const entries = await listDropboxFolder(rootPath)
  const folders = entries.filter(e => e['.tag'] === 'folder')

  const collections: Collection[] = await Promise.all(
    folders.map(async (folder): Promise<Collection> => {
      const subEntries = await listDropboxFolder(folder.path_display)
      const files = subEntries.filter(e => e['.tag'] === 'file')

      const assets = files
        .map(f => entryToAsset(f as DropboxFolderEntry, folder.path_display, folder.name))
        .filter((a): a is Asset => a !== null)

      // Get thumbnail for first image in folder
      const firstImage = assets.find(a => a.type === 'image' || a.type === 'svg')
      let coverAsset = firstImage

      if (firstImage) {
        const thumbUrl = await getThumbnailBase64(firstImage.path)
        if (thumbUrl) {
          coverAsset = { ...firstImage, thumbnailUrl: thumbUrl }
        }
      }

      return {
        id: folder.id,
        name: folder.name,
        path: folder.path_display,
        assetCount: files.length,
        coverAsset,
        access: 'public',
        lastModified: new Date().toISOString(),
      }
    })
  )

  return collections
}

export async function fetchAllAssets(rootPath = ''): Promise<Asset[]> {
  const entries = await listDropboxFolder(rootPath)
  const allAssets: Asset[] = []

  const rootFiles = entries.filter(e => e['.tag'] === 'file')
  rootFiles.forEach(f => {
    const asset = entryToAsset(f as DropboxFolderEntry, rootPath, 'General')
    if (asset) allAssets.push(asset)
  })

  const folders = entries.filter(e => e['.tag'] === 'folder')
  for (const folder of folders) {
    const folderEntries = await listDropboxFolder(folder.path_display)
    const folderFiles = folderEntries.filter(e => e['.tag'] === 'file')

    // Fetch thumbnails for images in batches
    const assets = await Promise.all(
      folderFiles.map(async f => {
        const asset = entryToAsset(f as DropboxFolderEntry, folder.path_display, folder.name)
        if (!asset) return null

        if (asset.type === 'image') {
          const thumbUrl = await getThumbnailBase64(asset.path)
          if (thumbUrl) {
            return { ...asset, thumbnailUrl: thumbUrl }
          }
        }
        return asset
      })
    )

    assets.forEach(a => { if (a) allAssets.push(a) })
  }

  return allAssets.sort(
    (a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime()
  )
}
