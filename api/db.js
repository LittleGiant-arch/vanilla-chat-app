export default async function handler(req, res) {
  // Vercel automatically injects these when you connect Supabase
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // The password you enter on the website
  const password = req.headers.authorization;

  // Security Check
  if (password !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // 1. GET: Load Chat History
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${url}/rest/v1/chats?pass_key=eq.${password}&select=history`, {
        headers: { 
          'apikey': key, 
          'Authorization': `Bearer ${key}`
        }
      });
      const data = await response.json();
      
      // If we found saved chats, send them back. Otherwise, send an empty array.
      if (data && data.length > 0) {
        return res.status(200).json({ history: data[0].history });
      } else {
        return res.status(200).json({ history: [] });
      }
    } catch (error) { 
      return res.status(500).json({ error: "Supabase Load Error" }); 
    }
  }

  // 2. POST: Save Chat History
  if (req.method === 'POST') {
    try {
      const { history } = req.body;
      
      // Upsert: Tell Supabase to Insert the chats, or Update them if they already exist
      await fetch(`${url}/rest/v1/chats`, {
        method: 'POST',
        headers: { 
          'apikey': key, 
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          pass_key: password,
          history: JSON.parse(history) // Convert it to proper JSON for the database
        })
      });
      
      return res.status(200).json({ success: true });
    } catch (error) { 
      return res.status(500).json({ error: "Supabase Save Error" }); 
    }
  }
}
