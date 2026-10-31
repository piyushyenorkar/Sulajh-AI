import 'dotenv/config';

async function testGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  console.log('Testing Groq with openai/gpt-oss-20b...');

  const messages = [
    {
      role: 'system',
      content: 'You are Sulajh AI, a polite assistant for Paytm merchants in Hindi/Hinglish.',
    },
    {
      role: 'user',
      content: 'Namaste! Sulajh AI kya hai?',
    },
  ];

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      messages,
      temperature: 0.2,
      max_tokens: 150,
    }),
  });

  if (!res.ok) {
    console.error('Groq error:', res.status, await res.text());
    return;
  }

  const data = await res.json() as any;
  console.log('Groq response success:');
  console.log(data.choices[0]?.message?.content);
}

testGroq();
