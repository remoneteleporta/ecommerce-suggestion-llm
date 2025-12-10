// /api/search.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  try {
    // ---- 1. Get query ----
    let query = req.query.q || "";
    if (!query) return res.status(400).json({ error: "Missing query" });

    // Convert spaces → + 
    query = query.replace(/ /g, "+");

    // ---- 2. Fetch from SERP API ----
    const serpUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${query}&google_domain=google.co.in&hl=en&gl=in&api_key=${process.env.SERP_API_KEY}`;
    const response = await fetch(serpUrl);

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: `SERP API error: ${text}` });
    }

    const serpData = await response.json();

    // Extract relevant fields
    const products = (serpData.shopping_results || []).map((p) => ({
      title: p.title,
      price: p.price,
      link: p.link,
      source: p.source,
    }));

    // ---- 3. Call Gemini (Official SDK) ----
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    // Safest option in serverless: fresh chat each time
    const chat = model.startChat({
      history: [
        {
          role: "system",
          parts: [
            {
              text: `
You are a shopping and product recommendation Expert.
Analyze JSON product lists and return:
- The Top 3 best products
- Short reasoning for each
- Highlight value, quality, and price
Keep the summary under 200 words.
              `,
            },
          ],
        },
      ],
    });

    const prompt = `
The following are shopping results for: ${query}

Products JSON:
${JSON.stringify(products, null, 2)}

Please:
1. Analyze the products
2. Pick the Top 3 best
3. Explain why each is recommended
4. Keep the result clear and concise
    `;

    const result = await chat.sendMessage(prompt);
    const summary = result.response.text();

    // ---- 4. Send Response ----
    return res.status(200).json({
      query,
      products,
      summary,
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

/* Avoid Amazon, Myntra or any large marketplace product recommendation and focus on smaller brands. */