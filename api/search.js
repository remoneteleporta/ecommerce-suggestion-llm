// /api/search.js
const { GoogleGenerativeAI } = require("@google-generativeai/google-generative-ai"); 
// IMPORTANT: Correct CommonJS import path

module.exports = async function handler(req, res) {
  try {
    // ---- 1. Get query ----
    let query = req.query.q || "";
    if (!query) return res.status(400).json({ error: "Missing query" });

    query = query.replace(/ /g, "+");

    // ---- 2. Fetch SERP API ----
    const serpUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${query}&google_domain=google.co.in&hl=en&gl=in&api_key=${process.env.SERP_API_KEY}`;
    const response = await fetch(serpUrl);

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: `SERP API error: ${text}` });
    }

    const serpData = await response.json();

    const products = (serpData.shopping_results || []).map((p) => ({
      title: p.title,
      price: p.price,
      link: p.link,
      source: p.source,
    }));

    // ---- 3. Gemini 2.0 Flash (Official SDK) ----
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const prompt = `
Shopping results for: ${query}

Products JSON:
${JSON.stringify(products, null, 2)}

Give the Top 3 products, explaining value, price, and quality.
    `;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    // ---- 4. Return result ----
    res.status(200).json({
      query,
      products,
      summary,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
