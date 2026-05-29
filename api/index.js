export default async function handler(req, res) {
  // Only accept POST requests from our frontend
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, instruction } = req.body;
    
    // Safely retrieve the hidden key from Vercel Environment Variables
    const apiKey = process.env.AI_API_KEY; 

    // Server-side fetch protecting the secret key from developer tools
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert editor. Fix grammar and style based on the instructions.' },
          { role: 'user', content: `Instruction: ${instruction}\n\nText: ${text}` }
        ]
      })
    });

    const data = await response.json();
    return res.status(200).json({ result: data.choices[0].message.content });

  } catch (error) {
    return res.status(500).json({ error: 'Backend server error' });
  }
}
