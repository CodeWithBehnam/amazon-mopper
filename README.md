# Amazon Mopper

A Chrome extension that enhances your Amazon shopping experience with discount badges, best value indicators, delivery countdowns, and more.

![Chrome Extension](https://img.shields.io/badge/manifest-v3-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-1.0.2-orange)

## Features

- **Discount Badges** — Neobrutalism-styled overlay badges showing discount percentages on product images
- **Best Value Indicator** — Highlights the best value product on the page with a border and badge (compares price-per-unit when available)
- **Delivery Countdown** — Inline badges showing days until delivery (Today, Tomorrow, X days)
- **Price Rounding** — Shows rounded prices next to the original for quick comparison
- **Title Truncation** — Shortens long product titles with hover-to-reveal full text
- **Hide Prime Icons** — Optionally remove Prime badges for a cleaner view
- **Popup Settings** — Toggle each feature on/off from the extension popup

## Supported Marketplaces

Works on all major Amazon domains: `.com`, `.co.uk`, `.de`, `.fr`, `.it`, `.es`, `.ca`, `.com.mx`, `.com.br`, `.co.jp`, `.in`, `.cn`, `.com.au`, `.nl`, `.sg`, `.ae`, `.sa`, `.se`, `.pl`, `.com.tr`, `.eg`

## Installation

### From Source

1. Clone the repository:
   ```bash
   git clone https://github.com/CodeWithBehnam/amazon-mopper.git
   cd amazon-mopper
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Build the extension:
   ```bash
   bun run build
   ```

4. Load in Chrome:
   - Open `chrome://extensions`
   - Enable **Developer mode**
   - Click **Load unpacked**
   - Select the `dist/` folder

## Development

```bash
bun run dev        # Start Vite dev server with HMR
bun run build      # Production build to dist/
```

### Version Bumping

```bash
bun run bump           # Bump patch version (1.0.2 → 1.0.3)
bun run bump:minor     # Bump minor version (1.0.2 → 1.1.0)
bun run bump:major     # Bump major version (1.0.2 → 2.0.0)
bun run release        # Bump patch + build
```

## Tech Stack

- **Runtime** — [Bun](https://bun.sh)
- **Build** — [Vite](https://vitejs.dev) + [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin)
- **UI** — [React 19](https://react.dev) + [Tailwind CSS 4](https://tailwindcss.com)
- **Extension** — Chrome Manifest V3
- **Style Isolation** — Shadow DOM for content script

## Architecture

```
src/
├── background/        # Service worker
├── content/           # Content script (injected into Amazon pages)
│   ├── components/    # React badge components
│   ├── hooks/         # useSettings, useMutationObserver
│   ├── lib/           # Parsers, calculators, DOM selectors
│   ├── App.tsx        # Main app with React portals
│   └── index.tsx      # Shadow DOM setup & entry point
└── popup/             # Extension popup (settings UI)
```

## License

[MIT](LICENSE)
