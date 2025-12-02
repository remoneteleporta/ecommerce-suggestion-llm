import OpenAI from "openai";

export async function handler(event, context) {
  const { data } = JSON.parse(event.body);
  if (!data) return { statusCode: 400, body: JSON.stringify({ error: "Missing data" }) };

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const messages = [
      { role: "system", content: "You are an Online Product Recommendation Expert." },
      { role: "user", content: JSON.stringify(data) },
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-5-nano",
      messages,
      temperature: 1,
    });

    return { statusCode: 200, body: JSON.stringify(completion.choices[0].message.content) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to fetch AI recommendations" }) };
  }
}
