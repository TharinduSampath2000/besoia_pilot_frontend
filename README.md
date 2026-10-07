# Besoia frontend

React + Vite + Tailwind single-page app. For setup, see the [root README](../README.md).

```bash
npm run dev          # http://localhost:5173, proxies /api to http://localhost:3000
npm run dev:mobile   # HTTPS on your local network, for testing on phones
npm run build        # production build into dist/
```

## Screens

| Route | Page | Guard |
|---|---|---|
| `/` | `pages/Home.jsx`: name entry, or "Welcome back" for returning visitors | none |
| `/quiz` | `pages/Quiz.jsx`: seven questions, one per screen | needs a session |
| `/match` | `pages/ScanOrShow.jsx`: show your QR or scan theirs, plus the connections list | needs completed answers |

Any other path redirects to `/`. The match result is a modal, not a page.

## Source layout

```
src/
  App.jsx                    Layout, header stepper, route guards
  main.jsx                   Entry point
  styles.css                 Tailwind layers and shared classes (.btn, .card, .input, .eyebrow)
  context/UserContext.jsx    Session, reconnect check, connections list, "start fresh"
  services/api.js            fetch wrapper with friendly error messages
  components/
    ui.jsx                   Button, Spinner, Alert, Avatar, Logo
    Stepper.jsx              3-step progress indicator in the header
    SignalBackground.jsx     Animated landing background
    QRDisplay.jsx            QR code with "Save as image"
    CameraScanner.jsx        Camera and image-upload scanner (loaded only when opened)
    MatchResultModal.jsx     Result sheet: score ring, shared answers, icebreaker, confetti
```

## How state works

- **Session:** the backend's `httpOnly` cookie is the source of truth. On load, `UserContext` calls `GET /api/session`. It restores a session the browser forgot and clears one that has expired.
- **localStorage:** stores `besoia_user` (name, session ID, quiz status) and `besoia_friends` (your connections and their results).
- **sessionStorage:** `besoia_quiz_draft` keeps answers you haven't submitted yet, so a refresh doesn't lose them.
- **Live result for the QR owner:** while **My code** is open, the page polls `GET /api/matches/pending` every 2.5 seconds. It shows a match whose `matchId` isn't already in the connections list.

## Design system

Colors, fonts and animations are defined in `tailwind.config.js`:

- Colors: `ink` (deep green), `accent` (orange), `cream`, `peach`
- Fonts: `font-display` (Fraunces) for headings, `font-sans` (Inter) for body text
- Animations: `fade-up`, `pop`, `halo`, `ripple`, `drift-a`/`drift-b`, `confetti`, `scan-line`, and more

Conventions:

- Use `<Button variant="primary | accent | secondary | ghost">` from `components/ui.jsx`. Tailwind only includes classes it can find written out in full, so never build class names from pieces, such as `` `btn-${variant}` ``.
- Hover styles only apply on devices with a mouse (`hoverOnlyWhenSupported`), so taps don't leave buttons stuck in their hover state.
- Modals and fixed backgrounds render through `createPortal` to `document.body`. The page wrapper animates `transform`, which would otherwise break `position: fixed`.
- Every animation is disabled when the device has "reduce motion" turned on.
