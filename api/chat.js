const config = require('../config.json');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { messages, model } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // Use the dropdown model, or fallback to the first one in config
        model: model || config.models[0].value, 
        messages: [
          { role: "system", content: config.systemPrompt },
          ...messages
        ]
      })
    });

    const data = await response.json();
    
    // Check if OpenRouter sent an error
    if (data.error) {
       return res.status(500).json({ error: data.error.message });
    }
    
    // Send the reply back
    res.status(200).json({ 
      reply: data.choices[0].message.content 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch from OpenRouter" });
  }
}
