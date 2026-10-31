import 'dotenv/config';

async function listModels() {
  const apiKey = process.env.GROQ_API_KEY;
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const data = await res.json() as any;
  console.log('Available models:');
  data.data.forEach((m: any) => console.log('-', m.id));
}

listModels();

