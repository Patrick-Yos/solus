const Groq = require('groq-sdk');
const chunksData = require('../public/dnd-chunks.json');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// UPDATED: Now works with object chunks and uses metadata
function findRelevantChunks(query, chunks, topK = 4) {
  if (!chunks || !Array.isArray(chunks)) return [];
  
  const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (queryTerms.length === 0) return [];
  
  const scored = chunks.map((chunk, idx) => {
    // Search in both content and metadata
    const chunkText = chunk.content.toLowerCase();
    const metadataText = [
      ...(chunk.metadata.characters || []),
      ...(chunk.metadata.locations || []),
      ...(chunk.metadata.factions || [])
    ].join(' ').toLowerCase();
    
    const searchableText = chunkText + ' ' + metadataText;
    
    let score = 0;
    
    // Exact phrase matching (bonus points)
    const phrases = query.match(/"([^"]+)"/g) || [];
    phrases.forEach(phrase => {
      const cleanPhrase = phrase.replace(/"/g, '').toLowerCase();
      if (searchableText.includes(cleanPhrase)) {
        score += 10 * (cleanPhrase.split(/\s+/).length); // Weight by phrase length
      }
    });
    
    // Named entity matching (characters/locations)
    const namedEntities = query.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
    namedEntities.forEach(name => {
      if (searchableText.includes(name.toLowerCase())) {
        score += 5;
      }
    });
    
    // Term frequency matching
    queryTerms.forEach(term => {
      if (searchableText.includes(term)) {
        const matches = searchableText.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
        score += (matches?.length || 1) * 2;
      }
    });
    
    return { chunk, score, idx };
  });
  
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(item => item.chunk);
}

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.GROQ_API_KEY) {
      console.error('SERVER ERROR: GROQ_API_KEY missing');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    // IMPORTANT: Now using the new structured chunks
    const relevantChunks = findRelevantChunks(message, chunksData.chunks || []);
    
    // Join only the content property
    const context = relevantChunks.map(c => c.content).join('\n\n---\n\n');
    
    // Enhanced prompt that tells the AI what metadata is available
    const prompt = `You are Reigen's log assistant, an expert on this D&D campaign.
Use ONLY the provided context to answer. If context lacks the answer, say so.

CONTEXT (retrieved from campaign log):
${context}

QUESTION: ${message}

ANSWER GUIDELINES:
- Be specific with names, locations, and events
- Use direct quotes when relevant
- If multiple events match, list chronologically
- Reference metadata when helpful: ${JSON.stringify(relevantChunks.map(c => c.metadata))}

ANSWER:`;

    const stream = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'moonshotai/kimi-k2-instruct-0905',
      temperature: 0.3, // Lowered for more factual answers
      max_tokens: 2048,
      stream: true,
    });

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
    console.error('Groq API Error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'AI Service Error', details: error.message });
    } else {
      res.end();
    }
  }
};
