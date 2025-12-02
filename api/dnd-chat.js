const Groq = require('groq-sdk');
// Path to your JSON data
const chunksData = require('../public/dnd-chunks.json'); 

const groq = new Groq({
  // VITAL: This reads the invisible key from Vercel Settings
  apiKey: process.env.GROQ_API_KEY, 
});

// Helper function to find context
function findRelevantChunks(query, chunks, topK = 4) {
  if (!chunks) return [];
  
  const queryTerms = query.toLowerCase().split(/\s+/);
  
  const scored = chunks.map((chunk, idx) => {
    const chunkLower = chunk.toLowerCase();
    let score = 0;
    queryTerms.forEach(term => {
      if (chunkLower.includes(term)) score++;
      // Give extra points for exact matches to improve relevance
      score += (chunkLower.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length * 0.5;
    });
    return { chunk, score, idx };
  });
  
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(item => item.chunk);
}

module.exports = async (req, res) => {
  // 1. CORS Headers (Allows your frontend to talk to this backend)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle browser pre-checks
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // SECURITY CHECK: Fail fast if the API key is missing in Vercel
    if (!process.env.GROQ_API_KEY) {
      console.error('SERVER ERROR: GROQ_API_KEY is missing in environment variables.');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    // 2. Prepare Context
    // We use "|| []" to prevent crashing if the json is empty
    const relevantChunks = findRelevantChunks(message, chunksData.chunks || []);
    const context = relevantChunks.join('\n\n---\n\n');
    
    const prompt = `You are a D&D session assistant. Use the following context from our campaign to answer questions. If the context doesn't contain relevant information, say so.

Context:
${context}

Question: ${message}
Answer:`;

    // 3. Call Groq
    const stream = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'openai/gpt-oss-120b',
      temperature: 0.7,
      max_tokens: 4096,
      stream: true,
    });

    // 4. Stream Response
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) res.write(content);
    }

    res.end();

  } catch (error) {
    console.error('Groq API Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'AI Service Error' });
    } else {
      res.end();
    }
  }
};
