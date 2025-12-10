# Simple Express + pkg Project

This is a minimal Express project prepared for packaging with `pkg`.

Quick start:

1. Install dependencies

```bash
npm install
```

2. Run in development

```bash
npm run dev
# or
node src/index.js
```

3. Build a standalone binary (requires `pkg`)

```bash
npm run build
# the output binary will be in the `dist/` folder
```

Notes:
- `pkg` is included as a dev dependency. If you prefer, install it globally: `npm i -g pkg`.
- The server listens on `PORT` env var or `3000` by default.
