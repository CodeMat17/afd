// One-off: registers this site's IPN URL with Pesapal and prints the ipn_id.
// Usage: yarn pesapal:register-ipn   (reads .env.local)
// Put the printed id in PESAPAL_IPN_ID (locally and on Netlify).

const BASE_URLS = {
  sandbox: "https://cybqa.pesapal.com/pesapalv3",
  live: "https://pay.pesapal.com/v3",
};

const env = process.env.PESAPAL_ENV === "live" ? "live" : "sandbox";
const { PESAPAL_CONSUMER_KEY, PESAPAL_CONSUMER_SECRET, SITE_URL } = process.env;
if (!PESAPAL_CONSUMER_KEY || !PESAPAL_CONSUMER_SECRET || !SITE_URL) {
  console.error("Set PESAPAL_CONSUMER_KEY, PESAPAL_CONSUMER_SECRET and SITE_URL first.");
  process.exit(1);
}

const base = BASE_URLS[env];
const headers = { Accept: "application/json", "Content-Type": "application/json" };

const auth = await fetch(`${base}/api/Auth/RequestToken`, {
  method: "POST",
  headers,
  body: JSON.stringify({ consumer_key: PESAPAL_CONSUMER_KEY, consumer_secret: PESAPAL_CONSUMER_SECRET }),
}).then((r) => r.json());
if (!auth.token) {
  console.error("Could not get a token:", auth.error ?? auth);
  process.exit(1);
}

const url = `${SITE_URL.replace(/\/+$/, "")}/api/pesapal/ipn`;
const ipn = await fetch(`${base}/api/URLSetup/RegisterIPN`, {
  method: "POST",
  headers: { ...headers, Authorization: `Bearer ${auth.token}` },
  body: JSON.stringify({ url, ipn_notification_type: "GET" }),
}).then((r) => r.json());
if (!ipn.ipn_id) {
  console.error("Could not register IPN:", ipn.error ?? ipn);
  process.exit(1);
}

console.log(`Registered ${url} (${env})`);
console.log(`PESAPAL_IPN_ID=${ipn.ipn_id}`);
