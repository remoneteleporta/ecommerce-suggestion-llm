export default async function handler(req, res) {
  try {
    let query = req.query.q || "";
    if (!query) return res.status(400).json({ error: "Missing query" });

    // Fix + signs
    query = query.replace(/ /g, "+");

    const serpUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${query}&google_domain=google.com&api_key=${process.env.SERP_API_KEY}`;
    const response = await fetch(serpUrl);
    
    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: `SERP API error: ${text}` });
    }

    const data = await response.json();

    // Example: just forward results + AI summary
    res.status(200).json({
      summary: "AI summary placeholder",
      products: data.shopping_results || []
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}
