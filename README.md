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
- `/report` emails the pilot data to `REPORT_EMAIL`, no sign-in

## Notes

- Session is an httpOnly cookie set by the backend. Name, quiz status and connections are also kept in localStorage.
- The QR screen fetches a new token every 30s and polls `/api/matches/recent` every 2.5s so user A sees the result.
- Deployed as a Render static site, see `render.yaml` in the backend repo.
