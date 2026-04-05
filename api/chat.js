const config = require('../config.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { messages, model, password } = req.body;

  if (password !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model || config.models[0].value, 
        messages: [{ role: "system", content: config.systemPrompt }, ...messages]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    res.status(200).json({ reply: data.choices[0].message.content });

  } catch (error) {
    res.status(500).json({ error: "API Failure" });
  }
}
