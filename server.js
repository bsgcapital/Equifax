
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.text({ type: "*/*" }));

const PORT = process.env.PORT || 3001;
const TOKEN_URL = process.env.TOKEN_URL || "https://api.equifax.com/oauth2/token";
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SCOPE = process.env.SCOPE || "https://api.equifax.com/business/oneview/consumer-credit/v1";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn("WARNING: CLIENT_ID or CLIENT_SECRET not set. /oauth/token will fail until you add them.");
}

// Healthcheck
app.get("/", (_req, res) => res.send("Embark Equifax Relay OK"));

// OAuth: exchange client credentials for token
app.post("/oauth/token", async (req, res) => {
  try {
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
    res.status(r.status);
    r.headers.forEach((v, k) => res.setHeader(k, v));
    res.send(text);
  } catch (e) {
    res.status(500).send(e.message || "OAuth error");
  }
});

// Generic relay: forward API calls to Equifax
app.post("/relay", async (req, res) => {
  const target = req.header("x-target-url");
  if (!target) return res.status(400).send("Missing x-target-url");
  try {
    const hdrs = { ...req.headers };
    delete hdrs["x-target-url"];
    delete hdrs["host"];
    delete hdrs["content-length"];

    const r = await fetch(target, { method: "POST", headers: hdrs, body: req.body });
    const text = await r.text();
    res.status(r.status);
    r.headers.forEach((v, k) => res.setHeader(k, v));
    res.send(text);
  } catch (e) {
    res.status(500).send(e.message || "Relay error");
  }
});

app.listen(PORT, () => console.log(`Relay running on :${PORT}`));
