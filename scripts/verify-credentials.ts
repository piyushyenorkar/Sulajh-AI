import 'dotenv/config';

async function testServices() {
  console.log('--- TESTING REAL CREDENTIALS ---');

  // 1. Supabase
  const supaUrl = process.env.SUPABASE_URL;
  const supaKey = process.env.SUPABASE_ANON_KEY;
  console.log('\n1. Testing Supabase URL:', supaUrl);
  try {
    const res = await fetch(`${supaUrl}/rest/v1/`, {
      headers: {
        apikey: supaKey!,
        Authorization: `Bearer ${supaKey}`,
      },
    });
    console.log('Supabase status:', res.status, res.statusText);
  } catch (err: any) {
    console.error('Supabase error:', err.message);
  }

  // 2. Groq
  const groqKey = process.env.GROQ_API_KEY;
  console.log('\n2. Testing Groq API...');
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        Authorization: `Bearer ${groqKey}`,
      },
    });
    if (res.ok) {
      const data = await res.json() as any;
      console.log('Groq models available count:', data.data?.length);
      console.log('Sample models:', data.data?.slice(0, 3).map((m: any) => m.id));
    } else {
      console.error('Groq HTTP error:', res.status, await res.text());
    }
  } catch (err: any) {
    console.error('Groq error:', err.message);
  }

  // 3. Sarvam
  const sarvamKey = process.env.SARVAM_API_KEY;
  console.log('\n3. Testing Sarvam API...');
  try {
    // Sarvam API subscription check
    const res = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': sarvamKey!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    console.log('Sarvam endpoint response code:', res.status);
    const text = await res.text();
    console.log('Sarvam response snippet:', text.slice(0, 100));
  } catch (err: any) {
    console.error('Sarvam error:', err.message);
  }

  // 4. Qdrant
  const qdrantUrl = process.env.QDRANT_URL;
  const qdrantKey = process.env.QDRANT_API_KEY;
  console.log('\n4. Testing Qdrant...');
  try {
    const res = await fetch(`${qdrantUrl}/collections`, {
      headers: {
        'api-key': qdrantKey!,
      },
    });
    if (res.ok) {
      const data = await res.json() as any;
      console.log('Qdrant collections:', data.result?.collections);
    } else {
      console.error('Qdrant HTTP error:', res.status, await res.text());
    }
  } catch (err: any) {
    console.error('Qdrant error:', err.message);
  }
}

testServices();

