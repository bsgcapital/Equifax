
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.text({ type: "application/*+json" })); // raw json
app.use(express.static("public"));

const PORT = process.env.PORT || 3001;
const TOKEN_URL = process.env.TOKEN_URL || "https://api.equifax.com/oauth2/token";
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SCOPE = process.env.SCOPE || "https://api.equifax.com/business/oneview/consumer-credit/v1";
const BASE_URL = (process.env.BASE_URL || "https://api.equifax.com/business/oneview/consumer-credit/v1").replace(/\/$/, "");

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/config", (_req, res) => {
  res.json({ baseUrl: BASE_URL, scope: SCOPE, tokenUrl: TOKEN_URL });
});

app.post("/oauth/token", async (_req, res) => {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.status(500).json({ error: "CLIENT_ID/CLIENT_SECRET not configured on server" });
    }
    const form = new URLSearchParams();
    form.set("grant_type", "client_credentials");
    if (SCOPE) form.set("scope", SCOPE);

    const r = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      },
      body: form.toString(),
    });
    const text = await r.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }
    res.status(r.status).json(json);
  } catch (e) {
    res.status(500).json({ error: e.message || "OAuth error" });
  }
});

app.post("/api/proxy", async (req, res) => {
  try {
    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { path, method = "POST", headers = {}, body, token } = b;
    if (!path) return res.status(400).json({ error: "Missing path" });
    if (!token) return res.status(401).json({ error: "Missing access token" });

    const url = BASE_URL + path;
    const hdrs = { ...headers, Authorization: `Bearer ${token}` };
    if (!hdrs["Content-Type"]) hdrs["Content-Type"] = "application/json";

    const r = await fetch(url, {
      method,
      headers: hdrs,
      body: ["POST","PUT","PATCH"].includes((method||"").toUpperCase()) ? JSON.stringify(body || {}) : undefined,
    });

    const text = await r.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    const outHeaders = {};
    r.headers.forEach((v,k)=> outHeaders[k]=v);

    res.status(r.status).json({ ok: r.ok, status: r.status, statusText: r.statusText, headers: outHeaders, body: json });
  } catch (e) {
    res.status(500).json({ error: e.message || "Proxy error" });
  }
});

app.listen(PORT, () => console.log(`Embark Equifax working server on :${PORT}`));
