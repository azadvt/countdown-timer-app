# Countdown Timer + Analytics — Shopify App

A Shopify embedded app that lets merchants create countdown timers for promotions and track impressions on their storefront. Built with the MERN stack, Shopify CLI 3.0, and a lightweight Preact widget.

## Setup Instructions

### Prerequisites

- Node.js v20+
- MongoDB running locally (or a remote URI)
- [Shopify Partners account](https://partners.shopify.com/signup)
- A Shopify development store

### Installation

```bash
git clone https://github.com/azadvt/countdown-timer-app.git
cd countdown-timer-app
npm install
```

### Local Development

```bash
npm run dev -- --store your-store.myshopify.com
```

This starts the Express backend, Vite dev server, and Cloudflare tunnel simultaneously via Shopify CLI.

### Running Tests

```bash
cd web && npm test
```

Uses Jest with `mongodb-memory-server` — no running MongoDB instance needed for tests.

### Linting

```bash
npm run lint
```

### Building the Widget

```bash
npm run build:widget
```

Bundles the Preact storefront widget into `extensions/countdown-widget/assets/`.

## Architecture

```
countdown-timer-app/
├── web/                          # Express backend + React admin
│   ├── models/                   # Mongoose schemas (Timer, Analytics)
│   ├── controllers/              # Route handlers
│   ├── middleware/                # Validation, rate limiting, error handling
│   ├── routes/                   # Express route definitions
│   ├── database/                 # MongoDB connection
│   └── frontend/                 # React admin panel (Polaris UI)
│       ├── pages/                # File-based routing (dashboard, analytics)
│       ├── components/           # TimerCard, TimerModal
│       └── hooks/                # useAuthenticatedFetch, useTimers
├── widget-src/                   # Preact storefront widget source
│   ├── index.js                  # Main widget component
│   ├── utils/
│   │   ├── api.js                # Fetch via Shopify app proxy
│   │   ├── evergreen.js          # localStorage session timer logic
│   │   └── time.js               # Countdown math helpers
│   └── build.js                  # esbuild config
├── extensions/
│   └── countdown-widget/         # Theme App Extension
│       ├── blocks/
│       │   └── countdown-timer.liquid
│       └── assets/               # Built widget bundle
└── eslint.config.js
```

### Key Decisions

**Theme App Extension over ScriptTag** — Theme extensions are the recommended approach. They survive app uninstalls gracefully, work with Online Store 2.0 themes, and give merchants control over placement via the theme editor.

**Preact instead of React for the widget** — The storefront widget needs to be tiny. Preact gives us the same component model at ~3KB vs React's ~40KB. The built bundle is 6.8KB gzipped, well under the 30KB target.

**requestAnimationFrame for countdown** — Using rAF instead of setInterval avoids timer drift and automatically pauses when the tab is hidden, saving CPU.

**MongoDB with multi-tenant isolation** — Every document has a `shop` field. All queries filter by shop from the authenticated session. This keeps data isolated between stores without separate databases.

**App proxy for widget API** — The storefront widget calls our API through Shopify's app proxy (`/apps/countdown/...`) instead of hitting the backend directly. This avoids CORS issues and keeps the backend URL private.

**esbuild for widget bundling** — Fast, zero-config bundler that produces minimal output. No need for webpack complexity for a single-file widget.

### Assumptions

- Merchants use Online Store 2.0 themes (required for theme app extensions)
- One active timer per product page (widget renders the first matching timer)
- Evergreen timers use localStorage — if blocked (incognito), the timer falls back to a runtime-only countdown that won't persist across page loads
- Timer dates are stored in UTC; the admin form uses the browser's local timezone

## API Endpoints

### Admin API (requires Shopify session auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/timers` | List all timers for the shop. Optional `?status=active\|scheduled\|expired` filter |
| GET | `/api/timers/:id` | Get a single timer |
| POST | `/api/timers` | Create a timer |
| PUT | `/api/timers/:id` | Update a timer |
| DELETE | `/api/timers/:id` | Delete a timer |
| GET | `/api/analytics/overview` | Aggregated stats (total timers, total impressions, per-timer breakdown) |
| GET | `/api/analytics/:timerId` | Daily analytics for a specific timer |

### Storefront API (public, rate-limited)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/storefront/timers?shop=...&productId=...` | Get active timers for a product. Returns with `Cache-Control: public, max-age=60` |
| POST | `/api/storefront/impression` | Track a timer impression. Body: `{ shop, timerId }` |

### Request/Response Examples

**Create a fixed timer:**
```json
POST /api/timers
{
  "name": "Black Friday Sale",
  "type": "fixed",
  "startDate": "2026-11-25T00:00:00.000Z",
  "endDate": "2026-11-30T23:59:00.000Z",
  "targetType": "all",
  "style": {
    "accentColor": "#e63946",
    "position": "top",
    "size": "medium",
    "urgencyEffect": "color_pulse",
    "message": "Sale ends in:"
  }
}
```

**Create an evergreen timer:**
```json
POST /api/timers
{
  "name": "Limited Time Offer",
  "type": "evergreen",
  "duration": 3600,
  "targetType": "products",
  "targetIds": ["gid://shopify/Product/123456"],
  "style": {
    "position": "below_title",
    "size": "small",
    "urgencyEffect": "shake"
  }
}
```

### Rate Limiting

- Admin routes: 100 requests/min per shop
- Storefront routes: 300 requests/min (higher limit to handle widget traffic from all visitors)

## Performance

- **Widget bundle**: 6.8KB gzipped (target was <30KB)
- **CLS prevention**: Widget container reserves space via `min-height`; renders nothing until data loads
- **Caching**: Storefront API returns `Cache-Control: public, max-age=60` so browsers and CDNs cache timer data for 60 seconds
- **Single API call**: Widget fetches all active timers for a product in one request
- **rAF countdown**: Smooth 60fps updates that automatically pause when tab is hidden

## What I'd Improve With More Time

- Add a date range chart to the analytics page using a charting library
- Implement webhook handlers for app uninstall cleanup
- Add E2E tests with Cypress or Playwright
- Support timezone selection in the timer form
- Add A/B testing for different timer styles
- Implement bulk timer operations (pause all, delete expired)
