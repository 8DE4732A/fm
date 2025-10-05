# Chinese FM Radio Station

现代化的中国广播电台在线收听平台 - A modern web application for listening to Chinese FM radio stations.

## Features

- 🎵 500+ radio stations from across China
- 🗺️ Organized by province/region
- 🔍 Real-time search functionality
- 📱 Responsive modern UI built with Next.js and Tailwind CSS
- ⚡ Fast static site deployment via GitHub Pages
- 🔄 Auto-updates radio station data every 30 minutes

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Data Source**: QingTing FM (蜻蜓FM) API
- **Deployment**: GitHub Pages (static export)
- **Automation**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Update radio station data
npm run update-data
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main radio player page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── .github/workflows/     # GitHub Actions workflows
│   ├── deploy.yml         # Deploy to GitHub Pages
│   └── fm.yml            # Update radio data
├── qtfm.js               # Node.js data fetching script
├── data.json             # Radio station data cache
├── next.config.js        # Next.js configuration
└── package.json          # Project dependencies
```

## API Integration

The application uses QingTing FM's GraphQL API to fetch radio station data:

- **Endpoint**: `https://webbff.qtfm.cn/www`
- **Authentication**: HMAC-MD5 signed URLs with timestamp tokens
- **Streaming**: Direct MP3 streams at 64kbps

## Deployment

The project automatically deploys to GitHub Pages when changes are pushed to the `main` branch:

1. GitHub Actions builds the Next.js application
2. Static files are exported to the `out` directory
3. Deployed to `https://[username].github.io/fm/`

## Automated Data Updates

Radio station data is automatically updated every 30 minutes via GitHub Actions:

- Fetches latest station information from QingTing FM
- Updates `data.json`
- Commits changes automatically

## Development

### Update Next.js Configuration

The `next.config.js` is configured for GitHub Pages deployment with:
- Static export mode
- Base path set to `/fm`
- Image optimization disabled (for static hosting)

### Update Radio Data Manually

```bash
node qtfm.js
```

This will fetch the latest data and update `data.json`.

## License

This project is for educational purposes. Radio streams are provided by QingTing FM.

## Credits

- Data source: [QingTing FM](https://www.qingting.fm)
- Built with [Next.js](https://nextjs.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)
