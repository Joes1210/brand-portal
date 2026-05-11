import { NextResponse } from 'next/server'
import { fetchAllAssets } from '@/lib/dropbox'
import { MOCK_ASSETS } from '@/lib/mock-data'

export const runtime = 'nodejs'
export const revalidate = 300 // 5 min cache

export async function GET() {
  // Use mock data if no Dropbox token configured
  if (!process.env.DROPBOX_ACCESS_TOKEN) {
    return NextResponse.json({
      assets: MOCK_ASSETS,
      source: 'mock',
      count: MOCK_ASSETS.length,
    })
  }

  try {
    const rootPath = process.env.DROPBOX_ROOT_FOLDER ?? ''
    const assets = await fetchAllAssets(rootPath)

    return NextResponse.json({
      assets,
      source: 'dropbox',
      count: assets.length,
    })
  } catch (error) {
    console.error('[API] Failed to fetch assets:', error)

    // Fallback to mock on error
    return NextResponse.json(
      {
        assets: MOCK_ASSETS,
        source: 'mock-fallback',
        count: MOCK_ASSETS.length,
        error: 'Dropbox unavailable — showing demo data',
      },
      { status: 200 }
    )
  }
}
