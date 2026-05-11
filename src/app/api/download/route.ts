import { NextRequest, NextResponse } from 'next/server'
import { getTemporaryLink } from '@/lib/dropbox'
import { MOCK_ASSETS } from '@/lib/mock-data'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')
  const id = searchParams.get('id')

  if (!path && !id) {
    return NextResponse.json({ error: 'path or id required' }, { status: 400 })
  }

  // Mock mode
  if (!process.env.DROPBOX_ACCESS_TOKEN) {
    const asset = MOCK_ASSETS.find(a => a.id === id || a.path === path)
    if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 })

    // Return a placeholder download in mock mode
    return NextResponse.json({
      url: asset.thumbnailUrl ?? 'https://placehold.co/400x400',
      name: asset.name,
      mock: true,
    })
  }

  try {
    const filePath = path!
    const url = await getTemporaryLink(filePath)
    return NextResponse.json({ url })
  } catch (error) {
    console.error('[API] Download error:', error)
    return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
  }
}
