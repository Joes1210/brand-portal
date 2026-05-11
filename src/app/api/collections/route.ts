import { NextResponse } from 'next/server'
import { buildCollections } from '@/lib/dropbox'
import { MOCK_COLLECTIONS } from '@/lib/mock-data'

export const runtime = 'nodejs'
export const revalidate = 300

export async function GET() {
  if (!process.env.DROPBOX_ACCESS_TOKEN) {
    return NextResponse.json({
      collections: MOCK_COLLECTIONS,
      source: 'mock',
    })
  }

  try {
const rootPath = ''
    const collections = await buildCollections(rootPath)

    return NextResponse.json({
      collections,
      source: 'dropbox',
    })
  } catch (error) {
    console.error('[API] Failed to fetch collections:', error)
    return NextResponse.json({
      collections: MOCK_COLLECTIONS,
      source: 'mock-fallback',
      error: 'Dropbox unavailable',
    })
  }
}
