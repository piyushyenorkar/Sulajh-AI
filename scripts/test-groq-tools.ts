import 'dotenv/config';

async function testGroqTools() {
  const apiKey = process.env.GROQ_API_KEY;
  const model = 'openai/gpt-oss-20b';
  console.log(`Testing Groq model ${model} with tools parameter...`);

  const tools = [
    {
      type: 'function',
      function: {
        name: 'get_settlement_status',
        description: 'Get live settlement status and details for the merchant',
        parameters: {
          type: 'object',
          properties: {
            settlement_id: { type: 'string', description: 'Settlement ID if known' },
          },
        },
      },
    },
  ];

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Mera settlement status check karo' }],
        tools,
        tool_choice: 'auto',
      }),
    });
    console.log('Status:', res.status);
    const json = await res.json() as any;
    console.log('Response message:', JSON.stringify(json.choices?.[0]?.message, null, 2));
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

testGroqTools();

