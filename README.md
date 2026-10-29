# besoia_pilot_frontend

React + Vite + Tailwind frontend for the Besoia pilot. API: [besoia_pilot_backend](https://github.com/TharinduSampath2000/besoia_pilot_backend).

```bash
npm install
npm run dev          # http://localhost:5173, /api proxied to localhost:3000
npm run dev:mobile   # https on the LAN for testing on phones
npm run build
```

The backend needs to be running. With `dev:mobile`, open the network URL on the phone and accept the certificate warning.

## Pages

- `/` name
- `/quiz` 7 questions
- `/match` show QR / scan, connections list
- `/reports` downloads the pilot data as an Excel file, behind a passcode remembered per device

## Notes

- Session is an httpOnly cookie set by the backend. Name, quiz status and connections are also kept in localStorage.
- The QR screen fetches a new token every 30s and polls `/api/matches/recent` every 2.5s so user A sees the result.
- English and Spanish. All UI text is in `src/i18n.jsx`. The language follows the phone's settings, can be switched with EN/ES in the header, and is remembered in localStorage. Question and icebreaker text comes from the API.
- Deployed as a Render static site, see `render.yaml` in the backend repo.
