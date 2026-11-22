# BPM Tap Tempo

Tap in rhythm with a song and get an instant BPM estimate. A practical tempo-tapping utility for musicians, DJs and producers.

**Live:** [bpm-tap-tempo.itsjust.tools](https://bpm-tap-tempo.itsjust.tools)

## Features

- Tap with the big pad, the toolbar button, `Space` or `T` — average BPM updates live
- Sliding window of recent taps (2–30s, default 10s); the sequence resets after 2 seconds of inactivity
- Live beat interval in milliseconds alongside BPM
- BPM confidence range (min/max interval among recent taps)
- Preset BPM reference grid (60/90/120/150/180) highlighting the nearest preset
- Audio click feedback via the Web Audio API (toggle with the sidebar switch or `K`)
- Copy the computed BPM to the clipboard (`C`) with toast feedback
- Shareable state via URL, `.itsjust.json` import/export and image/PDF export
- 100% client-side — no data ever leaves your browser

## Keyboard shortcuts

| Key           | Action             |
| ------------- | ------------------ |
| `Space` / `T` | Tap                |
| `R`           | Reset tap sequence |
| `C`           | Copy BPM           |
| `K`           | Toggle audio click |

## Development

```bash
npm install
npm run build -w @itsjust/core   # build shared core first
npm run dev
npm test
```

## Deployment

```bash
docker build -t itsjust-bpm-tap-tempo .
docker run -p 3000:3000 itsjust-bpm-tap-tempo
```

## License

MIT
