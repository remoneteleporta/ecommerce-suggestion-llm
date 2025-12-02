import fetch from "node-fetch";

export async function handler(event, context) {
  const q = event.queryStringParameters.q;
  if (!q) return { statusCode: 400, body: JSON.stringify({ error: "Missing query parameter" }) };

  const apiKey = process.env.SERP_API_KEY;
  const url = `https://serpapi.com/search?engine=google_shopping&q=${encodeURIComponent(q)}&api_key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to fetch product data" }) };
  }
}
