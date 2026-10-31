import 'dotenv/config';

async function testGroqEmbeddings() {
  const apiKey = process.env.GROQ_API_KEY;
  try {
    const res = await fetch('https://api.groq.com/openai/v1/embeddings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'bge-large-en-v1.5', input: 'test' }),
    });
    console.log('Groq embeddings status:', res.status, await res.text());
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

testGroqEmbeddings();

