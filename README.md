
# Embark × Equifax Relay (No-Code)

This tiny server keeps your Equifax **Client Secret** off the browser. Deploy it, then in your UI set:

- **CORS proxy** to `https://YOUR-RELAY/relay`
- Click **Get token** (UI will call `https://YOUR-RELAY/oauth/token`)

## Quick Deploy (Render)

1. Create a free account at Render.com
2. New → Web Service → **Deploy from a repo** (or use "Manual Deploy" and upload these files)
3. Set Build Command: `npm install`  — Start Command: `node server.js`
4. Add Environment Variables from `.env.example`
5. Deploy. Your base URL will look like `https://your-relay.onrender.com`

## Heroku

```bash
heroku create embark-equifax-relay
heroku config:set CLIENT_ID=... CLIENT_SECRET=... SCOPE=... TOKEN_URL=https://api.equifax.com/oauth2/token
git push heroku main
```

## Endpoints

- `POST /oauth/token` → exchanges client credentials for an access token
- `POST /relay` with header `x-target-url: <EQUIFAX API URL>` → forwards request

Security notes: only put secrets here (server). Never in the browser app.
