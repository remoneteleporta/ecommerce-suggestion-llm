// /api/search.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  try {
    let query = req.query.q || "";
    if (!query) return res.status(400).json({ error: "Missing query" });

    query = query.replace(/ /g, "+");

    // 1. Fetch SERP API
    const serpUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${query}&google_domain=google.co.in&hl=en&gl=in&api_key=${process.env.SERP_API_KEY}`;
    const serpRes = await fetch(serpUrl);

    if (!serpRes.ok) {
      const text = await serpRes.text();
      return res.status(500).json({ error: `SERP API error: ${text}` });
    }

    const serpData = await serpRes.json();

    const products = (serpData.shopping_results || []).map((p) => ({
      title: p.title,
      price: p.price,
      link: p.link,
      source: p.source,
    }));

    // 2. Gemini
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-3-pro-preview",
    });

    const prompt = `
Here are shopping results for: ${query}
Products:
${JSON.stringify(products, null, 2)}

Give me the top 3 products and explain why.
    `;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    return res.status(200).json({
      query,
      products,
      summary,
    });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
