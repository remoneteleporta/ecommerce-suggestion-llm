export default async function handler(req, res) {
  try {
    let query = req.query.q || "";
    if (!query) return res.status(400).json({ error: "Missing query" });

    // Fix + signs
    query = query.replace(/ /g, "+");

    const serpUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${query}&google_domain=google.co.in&hl=en&gl=in&api_key=${process.env.SERP_API_KEY}`;
    const response = await fetch(serpUrl);
    
   /*  https://serpapi.com/search.json?engine=google_shopping&q=Iphone&location=India&google_domain=google.co.in&hl=en&gl=in */

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: `SERP API error: ${text}` });
    }

    const serpData = await response.json();

    // Extract product titles & prices
    const products = (serpData.shopping_results || []).map((p) => ({
      title: p.title,
      price: p.price,
      link: p.link,
      source: p.source,
    }));

    // ---- 2. Call Google AI (Gemini) ----
    const aiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
        process.env.GOOGLE_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
The following are shopping results for: ${query}.
Products:
${JSON.stringify(products, null, 2)}

Please summarize the best choices, highlight value and quality, and give a clear top 3 recommendation.
                  `,
                },
              ],
            },
          ],
        }),
      }
    );

    const aiData = await aiResponse.json();
    const summary =
      aiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Could not generate summary";

    return res.status(200).json({
      query,
      products,
      summary,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}

