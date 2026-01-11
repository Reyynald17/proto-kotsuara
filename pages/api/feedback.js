const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 1000;
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const data = rateLimitMap.get(ip);

  if (!data) {
    rateLimitMap.set(ip, { count: 1, time: now });
    return false;
  }

  if (now - data.time > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, time: now });
    return false;
  }

  data.count++;
  return data.count > RATE_LIMIT;
}

function sanitize(text) {
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    "unknown";

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  const { name, message, status } = req.body || {};

  if (!message || message.length > 800) {
    return res.status(400).json({ error: "Invalid message" });
  }

  const allowedStatus = ["biasa", "penting", "sangat_penting"];
  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const payload = {
    id: `fb-${Date.now()}`,
    name: name ? sanitize(name).slice(0, 50) : "Anonim",
    message: sanitize(message),
    status,
    created_at: new Date().toISOString()
  };

  try {
    const getRes = await fetch(
      `https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}/latest`,
      {
        headers: {
          "X-Master-Key": process.env.JSONBIN_API_KEY
        }
      }
    );

    const current = await getRes.json();
    const feedbacks = current.record.feedbacks || [];

    feedbacks.push(payload);

    const putRes = await fetch(
      `https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": process.env.JSONBIN_API_KEY
        },
        body: JSON.stringify({ feedbacks })
      }
    );

    if (!putRes.ok) throw new Error("JSONBin error");

    return res.status(201).json({ success: true });
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
}
