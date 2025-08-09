
# Embark × Equifax — Working Example

This is a complete, deployable example that:
- fetches an OAuth2 access token from Equifax using client credentials (server-side), and
- calls the OneView Consumer Credit API via a secure server proxy.

## Deploy (Render)

1) Create a new Web Service from this repo.
2) Build Command: `npm install`
3) Start Command: `node server.js`
4) Environment variables (from `.env.example`): CLIENT_ID, CLIENT_SECRET, SCOPE, TOKEN_URL, BASE_URL.
5) Deploy — open the URL and use the page to Get Token → Send Request.

## Endpoints

- `GET /config` — returns baseUrl/scope/tokenUrl to fill the page
- `POST /oauth/token` — returns `{ access_token, ... }`
- `POST /api/proxy` — forwards to `${BASE_URL}${path}` with `Authorization: Bearer <token>`

> Update the request JSON and path in the page to match the exact schema/path in your Equifax portal.
