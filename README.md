# ✦ Brand Digital Asset Portal

A premium, production-ready brand asset portal built with **Next.js 14 + TypeScript + Tailwind CSS**, integrated with the **Dropbox API** for dynamic asset management.

Designed to feel like a luxury brand portal — not a generic file browser.

---

## ✦ Features

- **Dropbox Integration** — reads folder structure automatically, displays folders as collections
- **Dynamic Asset Gallery** — grid + list views, infinite scroll, masonry-ready
- **Full-text Search** — instant results, keyboard navigation, recent searches
- **Smart Filters** — by type, collection, sort order
- **Asset Detail Modal** — preview, metadata, dimensions, size, tags, download, copy link
- **Favorites System** — persistent bookmarks via localStorage
- **Download Tracking** — hooks for analytics (extend with your analytics platform)
- **New Badges** — automatically marks assets added within 7 days
- **Skeleton Loaders** — smooth loading states throughout
- **Dark / Light Mode** — toggle with system preference support
- **Responsive** — mobile-first, works beautifully on all screen sizes
- **Keyboard Navigation** — ⌘K search, Esc to close, ↑↓ to navigate results
- **Auth Architecture** — stubbed for NextAuth.js, ready to extend
- **Demo Mode** — works without a Dropbox token using realistic mock data

---

## ✦ Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS custom properties |
| Dropbox | Dropbox API v2 (direct HTTP, no SDK required) |
| Data fetching | SWR |
| Animations | CSS transitions + Framer Motion ready |
| Fonts | Cormorant Garamond (display) + DM Sans (body) |
| Deployment | Vercel |

---

## ✦ Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout, ThemeProvider
│   ├── page.tsx             # Homepage (hero, collections, recent assets)
│   ├── library/
│   │   └── page.tsx         # Full asset library with filters
│   └── api/
│       ├── assets/route.ts  # GET /api/assets — all assets
│       ├── collections/route.ts  # GET /api/collections
│       └── download/route.ts     # GET /api/download?path=...
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx       # Sticky nav, search trigger, theme toggle
│   │   └── Footer.tsx       # Multi-column footer
│   └── assets/
│       ├── AssetCard.tsx    # Grid + list card variants, skeleton
│       ├── AssetModal.tsx   # Full detail modal with preview
│       ├── SearchModal.tsx  # Command palette style search
│       ├── FilterBar.tsx    # Type pills, collection menu, sort, view toggle
│       └── CollectionCard.tsx  # Collection browser cards
├── hooks/
│   └── index.ts             # useAssets, useCollections, useFilteredAssets,
│                            #   useFavorites, useDownload, useIntersectionObserver,
│                            #   useKeyboardShortcut, useDebounce
├── lib/
│   ├── dropbox.ts           # Dropbox API client, folder → Asset transform
│   ├── mock-data.ts         # Demo assets + collections for development
│   └── utils.ts             # cn(), formatFileSize(), filterAssets(), etc.
├── styles/
│   └── globals.css          # CSS variables, base styles, skeleton, glass
└── types/
    └── index.ts             # Asset, Collection, AssetFilters, User, AuthContext
```

---

## ✦ Setup & Installation

### 1. Clone and install

```bash
git clone <your-repo>
cd brand-portal
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DROPBOX_ACCESS_TOKEN=your_token_here
DROPBOX_ROOT_FOLDER=          # leave blank for root, or /Brand Assets
NEXT_PUBLIC_APP_NAME=Brand Portal
```

### 3. Run locally

```bash
npm run dev
# → http://localhost:3000
```

> **Note:** Without a `DROPBOX_ACCESS_TOKEN`, the portal runs in **demo mode** with realistic mock data. Everything works — search, filters, favorites, modals.

---

## ✦ Dropbox API Setup

### Step 1 — Create a Dropbox App

1. Go to [dropbox.com/developers/apps](https://www.dropbox.com/developers/apps)
2. Click **Create app**
3. Choose **Scoped access** → **Full Dropbox**
4. Name it (e.g. "Brand Portal")

### Step 2 — Set permissions

In your app's **Permissions** tab, enable:
- `files.metadata.read`
- `files.content.read`
- `sharing.read`

### Step 3 — Generate an access token

In the **Settings** tab → **OAuth 2** → **Generate access token**

Copy the token into your `DROPBOX_ACCESS_TOKEN` env var.

### Step 4 — Set your root folder (optional)

If your assets are in a subfolder like `/Brand Assets`, set:
```env
DROPBOX_ROOT_FOLDER=/Brand Assets
```

Leave blank to use the root of your Dropbox.

### How syncing works

The portal uses **on-demand fetching with Next.js caching**:

1. Browser loads `/library`
2. SWR calls `/api/assets`
3. API calls Dropbox `files/list_folder` recursively
4. Results are cached for 5 minutes (`revalidate: 300`)
5. After 5 min, next request triggers a fresh Dropbox fetch
6. Download links use `files/get_temporary_link` (4-hour expiry)

This means **no webhooks or sync jobs needed** — the portal stays current with 5-minute latency.

---

## ✦ Deployment to Vercel

### Method A — Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

### Method B — GitHub Integration

1. Push to GitHub
2. Connect repo in [vercel.com/new](https://vercel.com/new)
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment variables in Vercel

```
DROPBOX_ACCESS_TOKEN        → (secret)
DROPBOX_ROOT_FOLDER         → (blank or /path)
NEXT_PUBLIC_APP_NAME        → Brand Portal
NEXT_PUBLIC_APP_TAGLINE     → Official Brand Assets
NEXT_PUBLIC_BRAND_COLOR     → #8B5E3C
```

---

## ✦ Customization

### Branding

Edit `tailwind.config.ts` → `theme.extend.colors.brand` to change the color palette.

Edit `src/styles/globals.css` → CSS variables at `:root` and `.dark` for full theme control.

### App name / tagline

```env
NEXT_PUBLIC_APP_NAME=Your Brand
NEXT_PUBLIC_APP_TAGLINE=Official Assets
```

### Add new file types

`src/lib/utils.ts` → `getAssetType()` maps extensions to asset types.

### Dropbox folder structure

The portal reads **any folder structure** automatically. Folder names become collection names. Recommend organizing like:

```
Dropbox/
├── Brand Logos/
├── Brand Guidelines/
├── Photography/
├── Social Media/
├── Video Assets/
└── Print Materials/
```

---

## ✦ Adding Authentication (NextAuth.js)

The codebase is architected for auth. To add it:

```bash
npm install next-auth
```

1. Create `src/app/api/auth/[...nextauth]/route.ts`
2. Use the `User` and `AuthContext` types in `src/types/index.ts`
3. Add `access: 'partner' | 'internal'` to assets in `src/lib/dropbox.ts`
4. Gate API routes with session checks

See [next-auth.js.org](https://next-auth.js.org) for provider setup.

---

## ✦ Scaling to a Full DAM

| Feature | How to add |
|---|---|
| **CMS** | Connect Contentful or Sanity to manage asset metadata / descriptions |
| **Redis cache** | Replace in-memory cache with `ioredis` for multi-instance caching |
| **Webhooks** | Use Dropbox webhooks to invalidate cache on file changes |
| **Upload UI** | Add `files/upload` API endpoint and drag-drop UI |
| **Analytics** | Wire `trackDownload()` in `utils.ts` to PostHog, Segment, or GA4 |
| **Bulk download** | Zip selected files server-side using `archiver` npm package |
| **Tags/metadata** | Store in a Postgres/PlanetScale table keyed by Dropbox file ID |
| **Image CDN** | Route `thumbnailUrl` through Cloudinary or imgix |
| **Search** | Replace client-side filter with Algolia or Meilisearch for 10k+ assets |
| **Multi-tenant** | Namespace by subdomain, each with own Dropbox token |

---

## ✦ License

For authorized use only. All brand assets are protected.
