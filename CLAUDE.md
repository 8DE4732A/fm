# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chinese radio streaming web application that aggregates FM radio stations from across China. The project fetches radio station data from the QingTing FM (蜻蜓FM) API and provides a web interface for listening to live radio streams.

## Architecture

### Backend Components

1. **qtfm.py** - Core API integration module
   - `get_mp3_url(id)`: Generates signed streaming URLs using HMAC-MD5 authentication with timestamp-based tokens
   - `get_regions()`: Fetches list of geographic regions from QingTing FM API
   - `get_radios(cid)`: Fetches radio stations for a specific region
   - When run as main script, generates `data.json` with all regions and their radio stations

### Frontend Files

- **index.html** - Static version that loads `data.json` client-side and generates streaming URLs in browser using CryptoJS

### Data Pipeline

- **data.json** - Pre-fetched cache of all regions and radio stations (129KB, contains ~500+ stations organized by province)
- Automatically updated every 30 minutes via GitHub Actions workflow

## Development Commands

### Update the radio station data
```bash
python qtfm.py
# Fetches latest data and writes to data.json
```

### Install dependencies
```bash
pip install -r requirements.txt
```

## Key Technical Details

### Authentication/Streaming
- Radio streams require HMAC-MD5 signed URLs with format: `https://lhttp.qingting.fm/live/{id}/64k.mp3?app_id=web&ts={timestamp}&sign={signature}`
- Signing key: `Lwrpu$K5oP`
- Timestamp is hex-encoded Unix time + 1 hour (token expiry)
- Sign calculation: `HMAC-MD5("app_id=web&path=/live/{id}/64k.mp3&ts={ts}", "Lwrpu$K5oP")`

### API Integration
- QingTing FM uses a GraphQL-style endpoint at `https://webbff.qtfm.cn/www`
- Queries are sent as POST requests with JSON body containing a `query` field
- Radio ID 432 appears to be the root category for browsing all regions

### Deployment
- GitHub Actions workflow (`.github/workflows/`) runs every 30 minutes (cron: `*/30 * * * *`)
- Workflow automatically:
  1. Installs Python 3.9 and dependencies
  2. Runs `python qtfm.py` to update data.json
  3. Commits and pushes changes if data has changed

## Important Notes

- The server runs on port 80 which requires sudo/admin privileges on most systems
- The project is designed for deployment on GitHub Pages with static index.html or as a web service with server.py
- data.json contains hierarchical structure: `{region_id: {title, radios: [...]}}`
