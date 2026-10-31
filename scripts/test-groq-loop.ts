import 'dotenv/config';
import { executeTool } from '../apps/api/src/agent/tools.js';

async function testGroqEndToEnd() {
  const apiKey = process.env.GROQ_API_KEY;
  console.log('Testing full Groq tool-calling round-trip...');

  const messages: any[] = [
    {
      role: 'system',
      content:
        'You are Sulajh AI, autonomous Paytm resolution teammate. Call tools before answering. Reply in polite Hinglish.',
    },
    {
      role: 'user',
      content: 'Bhai kal ka settlement status check karo mera',
    },
  ];

  const tools = [
    {
      type: 'function',
      function: {
        name: 'get_settlement_status',
        description: 'Get settlement status for merchant',
        parameters: {
          type: 'object',
          properties: {
            settlement_id: { type: 'string' },
          },
        },
      },
    },
  ];

  const res1 = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      messages,
      tools,
      tool_choice: 'auto',
    }),
  });

  const json1 = await res1.json() as any;
  const assistantMsg = json1.choices[0].message;
  console.log('Step 1 Groq Assistant Message:');
  console.log(assistantMsg);

  if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
    const tc = assistantMsg.tool_calls[0];
    console.log(`\nExecuting tool: ${tc.function.name}`);
    const toolRes = await executeTool(
      tc.function.name,
      {},
      { merchantId: 'mch-1', caseId: 'case-demo-1' }
    );
    console.log('Tool execution output:', toolRes.output);

    messages.push(assistantMsg);
    messages.push({
      role: 'tool',
      tool_call_id: tc.id,
      content: JSON.stringify(toolRes.output),
    });

    // Step 2: Groq produces final grounded response
    const res2 = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages,
      }),
    });

    const json2 = await res2.json() as any;
    console.log('\nStep 2 Final Response:');
    console.log(json2.choices[0].message.content);
  }
}

testGroqEndToEnd().catch(console.error);

