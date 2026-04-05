const config = require('../config.json');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { messages } = req.body;

  try {
    // Send the request to OpenRouter securely
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: config.modelName,
        messages: [
          { role: "system", content: config.systemPrompt },
          ...messages
        ]
      })
    });

    const data = await response.json();
    
    // Send the AI's reply back to your frontend
    res.status(200).json({ 
      reply: data.choices[0].message.content 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch from OpenRouter" });
  }
}
