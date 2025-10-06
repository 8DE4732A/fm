# Chinese FM Radio Station

现代化的中国广播电台在线收听平台 - A modern web application for listening to Chinese FM radio stations.

## Features

- 🎵 500+ radio stations from across China
- 🗺️ Organized by province/region
- 🔍 Real-time search functionality
- 📱 Responsive modern UI built with Next.js and Tailwind CSS
- ⚡ Fast and reliable data delivery via Cloudflare Workers
- 🔄 Auto-cached data with 1-hour refresh cycle
- 🌐 CDN-powered global access

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Cloudflare Workers + KV Storage
- **Data Source**: QingTing FM (蜻蜓FM) API
- **Deployment**:
  - Frontend: GitHub Pages (static export)
  - API: Cloudflare Workers
- **Caching**: Cloudflare Workers KV (1-hour TTL)

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Cloudflare account (for Workers deployment)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Visit `http://localhost:3000` to see the application.

### Cloudflare Workers Setup

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Create KV namespace:
```bash
wrangler kv:namespace create "QTFM_KV"
```

4. Update `wrangler.toml` with your KV namespace ID

5. Deploy the Worker:
```bash
wrangler deploy
```

The Worker will be available at `https://your-worker.your-subdomain.workers.dev/`

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main radio player page (dynamic data fetching)
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── .github/workflows/     # GitHub Actions workflows
│   └── deploy.yml         # Deploy to GitHub Pages
├── worker.js              # Cloudflare Workers script (API + KV caching)
├── wrangler.toml          # Cloudflare Workers configuration
├── qtfm.js                # Node.js data fetching script
├── index.html             # Static HTML version
├── data.json              # Radio station data cache (fallback)
├── next.config.js         # Next.js configuration
└── package.json           # Project dependencies
```

## API Integration

### Data Fetching

The application uses QingTing FM's GraphQL API:

- **Endpoint**: `https://webbff.qtfm.cn/www`
- **Method**: POST with GraphQL query
- **Caching**: Cloudflare Workers KV with 1-hour TTL
- **Streaming**: HMAC-MD5 signed MP3 URLs at 64kbps

### Cloudflare Workers API

The Cloudflare Worker provides a single endpoint:

**GET** `https://crimson-poetry-6661.fireliuping.workers.dev/`

Returns radio station data in JSON format:
```json
{
  "region_id": {
    "title": "Region Name",
    "radios": [
      {
        "id": 123,
        "title": "Radio Station Name",
        "imgUrl": "//image.url",
        "desc": "Description",
        "playcount": 100000
      }
    ]
  }
}
```

**Caching Behavior:**
- Fresh data (< 1 hour): Returns cached data immediately
- Stale data (≥ 1 hour): Returns stale data + triggers background refresh
- No cache: Fetches new data synchronously
- Auto-cleanup: Removes old KV entries after refresh

## Deployment

### Frontend Deployment (GitHub Pages)

The project automatically deploys to GitHub Pages when changes are pushed to the `main` branch:

1. GitHub Actions builds the Next.js application
2. Static files are exported to the `out` directory
3. Deployed to `https://[username].github.io/fm/`

### Backend Deployment (Cloudflare Workers)

The Cloudflare Worker handles all data fetching and caching:

1. Deploy using `wrangler deploy`
2. Worker URL: `https://crimson-poetry-6661.fireliuping.workers.dev/`
3. Automatic KV caching with 1-hour refresh cycle
4. Global CDN distribution for low latency

## Data Architecture

### Previous Architecture (Deprecated)
- ❌ GitHub Actions cron job (every 30 minutes)
- ❌ Static `data.json` committed to repository
- ❌ Manual data updates required

### Current Architecture
- ✅ Cloudflare Workers + KV for dynamic caching
- ✅ Automatic data refresh when stale (1 hour TTL)
- ✅ No manual intervention needed
- ✅ Always fresh data without repository commits

## Development

### Local Development

```bash
# Start Next.js dev server
npm run dev

# Test Cloudflare Worker locally
wrangler dev
```

### Update Next.js Configuration

The `next.config.js` is configured for GitHub Pages deployment with:
- Static export mode
- Base path set to `/fm`
- Image optimization disabled (for static hosting)

### Testing the API

```bash
# Fetch radio data from Worker
curl https://crimson-poetry-6661.fireliuping.workers.dev/

# Check cache status
curl -I https://crimson-poetry-6661.fireliuping.workers.dev/
```

## Files Overview

### Core Files

- **`worker.js`** - Cloudflare Workers script with KV caching logic
- **`app/page.tsx`** - Modern Next.js radio player UI (fetches from Worker)
- **`index.html`** - Lightweight static HTML version (fetches from Worker)
- **`qtfm.js`** - Node.js script for local testing and data exploration
- **`wrangler.toml`** - Cloudflare Workers configuration

### Key Dependencies

- `crypto-js` - HMAC-MD5 signing for MP3 stream authentication
- `next` - React framework
- `tailwindcss` - Utility-first CSS framework

## License

This project is for educational purposes. Radio streams are provided by QingTing FM.

## Credits

- Data source: [QingTing FM](https://www.qingting.fm)
- Built with [Next.js](https://nextjs.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)
