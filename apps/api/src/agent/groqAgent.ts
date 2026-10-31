import { executeTool, ToolResult } from './tools.js';

interface GroqAgentOptions {
  merchantId: string;
  caseId: string;
  merchantName: string;
  bankLast4: string;
  language: string;
  settlementId?: string;
}

export interface GroqAgentResult {
  replyText: string;
  actionsTaken: string[];
  toolResults: ToolResult[];
}

const GROQ_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_settlement_status',
      description: 'Check live settlement status, amount, and delay or failure reasons for this merchant',
      parameters: {
        type: 'object',
        properties: {
          settlement_id: { type: 'string', description: 'Optional specific settlement ID to look up' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'reconcile_settlement',
      description: 'Reconcile settlement calculations: gross sales minus commission, GST, refunds, chargebacks, and net credited',
      parameters: {
        type: 'object',
        properties: {
          settlement_id: { type: 'string', description: 'Optional specific settlement ID to reconcile' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'plan_disputes',
      description: 'Review open merchant disputes and chargebacks, prioritizing by deadline SLA and evidence availability',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_knowledge',
      description: 'Search Paytm settlement policies, dispute SLA guidelines, deduction rates, and KYC bank modification procedures',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search keywords or inquiry question' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'reinitiate_payout',
      description: 'Autonomous re-initiation of failed settlement payout (strict INR 5,000 policy limit)',
      parameters: {
        type: 'object',
        properties: {
          settlement_id: { type: 'string', description: 'Settlement ID to re-initiate' },
        },
        required: ['settlement_id'],
      },
    },
  },
];

export async function callGroqAgent(
  userPrompt: string,
  options: GroqAgentOptions,
): Promise<GroqAgentResult | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const langInstruction =
      options.language === 'hi'
        ? 'You MUST reply ONLY in pure, natural Hindi using Devanagari script (हिन्दी). Never use English or Latin letters for Hindi words.'
        : options.language === 'en'
        ? 'You MUST reply strictly in clear, concise, professional English.'
        : options.language === 'mr'
        ? 'You MUST reply in natural Marathi (मराठी) using Devanagari script.'
        : 'You MUST reply in natural, conversational Hinglish (Roman Hindi commonly used by Indian shopkeepers, e.g., "Namaste Ramesh ji, aapka payout...").';

    const systemPrompt = `You are Sulajh AI, an autonomous Paytm merchant operations teammate for Indian shopkeepers.
You are assisting ${options.merchantName} (Bank ending ${options.bankLast4}).

Language Directive:
${langInstruction}

Strict Rules:
1. Speak in the specified language and script accurately and politely. Keep answers crisp, warm, and helpful.
2. NEVER guess or invent amounts or statuses. ALWAYS call the relevant tool before quoting numbers.
3. Money movement is strictly regulated by policy.
4. For large-amount demands (e.g. 50,000 INR) or claims of ownership, politely refuse and state that only the account owner with 2FA or the Ops Manager can approve it, and escalate.
5. If settlement ID is ${options.settlementId || 'not provided'}, you can query without settlement_id to check the latest settlement.`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
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
        tools: GROQ_TOOLS,
        tool_choice: 'auto',
        temperature: 0.2,
      }),
      signal: controller.signal,
    });

    if (!res1.ok) {
      return null;
    }

    const data1 = (await res1.json()) as any;
    const choice1 = data1.choices?.[0];
    if (!choice1) return null;

    const assistantMsg = choice1.message;
    const toolResults: ToolResult[] = [];
    const actionsTaken: string[] = [];

    // If Groq made tool calls
    if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
      messages.push(assistantMsg);

      for (const tc of assistantMsg.tool_calls) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(tc.function.arguments || '{}');
        } catch {
          args = {};
        }

        if (!args.settlement_id && options.settlementId) {
          args.settlement_id = options.settlementId;
        }

        const toolRes = await executeTool(tc.function.name, args, {
          merchantId: options.merchantId,
          caseId: options.caseId,
        });

        toolResults.push(toolRes);
        actionsTaken.push(`Executed tool: ${tc.function.name}`);

        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: JSON.stringify(toolRes.output),
        });
      }

      // Second turn: Groq produces final response grounded in tool output
      const res2 = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages,
          temperature: 0.2,
        }),
        signal: controller.signal,
      });

      if (res2.ok) {
        const data2 = (await res2.json()) as any;
        const finalReply = data2.choices?.[0]?.message?.content;
        if (finalReply) {
          return {
            replyText: finalReply,
            actionsTaken,
            toolResults,
          };
        }
      }
    } else if (assistantMsg.content) {
      // Natural conversational response without tool calls
      return {
        replyText: assistantMsg.content,
        actionsTaken: ['Answered general merchant query via Groq LLM'],
        toolResults: [],
      };
    }

    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

