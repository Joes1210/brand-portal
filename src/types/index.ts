// ============================================================
// TYPES — Brand Digital Asset Portal
// ============================================================

export type AssetType =
  | 'image'
  | 'video'
  | 'pdf'
  | 'svg'
  | 'vector'  // .ai, .eps
  | 'archive' // .zip
  | 'unknown'

export type AssetAccess = 'public' | 'partner' | 'internal'

export interface Asset {
  id: string
  name: string
  displayName: string
  path: string
  type: AssetType
  extension: string
  size: number           // bytes
  sizeFormatted: string
  modified: string       // ISO date string
  dropboxId: string
  thumbnailUrl?: string
  previewUrl?: string
  downloadUrl?: string
  sharedLink?: string
  width?: number
  height?: number
  tags: string[]
  collection: string     // parent folder name
  collectionPath: string // full folder path
  isNew: boolean         // added within last 7 days
  access: AssetAccess
  mimeType?: string
}

export interface Collection {
  id: string
  name: string
  path: string
  assetCount: number
  coverAsset?: Asset
  description?: string
  subCollections?: Collection[]
  access: AssetAccess
  lastModified: string
}

export interface DropboxFolderEntry {
  '.tag': 'folder' | 'file'
  id: string
  name: string
  path_lower: string
  path_display: string
  client_modified?: string
  server_modified?: string
  size?: number
  is_downloadable?: boolean
}

export interface AssetFilters {
  search: string
  type: AssetType | 'all'
  collection: string
  sortBy: 'name' | 'date' | 'size' | 'type'
  sortOrder: 'asc' | 'desc'
  access: AssetAccess | 'all'
}

export interface DownloadEvent {
  assetId: string
  assetName: string
  timestamp: string
  userId?: string
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

// Auth stubs — expand later with NextAuth
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'partner' | 'public'
  avatar?: string
}

export interface AuthContext {
  user: User | null
  isLoading: boolean
  signIn: () => void
  signOut: () => void
}
