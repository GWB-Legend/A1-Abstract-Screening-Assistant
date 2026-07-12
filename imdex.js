import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL_ID = 'gpt-4o-mini'; // Fast, cheap, and supports JSON mode

/**
 * Screens an abstract based on provided criteria.
 * Sabi Core Responsible AI requirement: Logs model, version, and exact prompt.
 */
export async function screenAbstract({ abstract, inclusionCriteria, exclusionCriteria }) {
  const systemPrompt = `You are an expert research assistant performing systematic title/abstract screening. 
You must evaluate the provided abstract strictly against the provided inclusion and exclusion criteria.
Do not hallucinate or assume criteria that are not explicitly listed.
You must respond with valid JSON containing exactly three keys: "decision" (must be exactly "include", "exclude", or "uncertain"), "reason" (a one-sentence explanation).`;

  const userPrompt = `**Inclusion Criteria:**
 ${inclusionCriteria.map(c => `- ${c}`).join('\n')}

**Exclusion Criteria:**
 ${exclusionCriteria.map(c => `- ${c}`).join('\n')}

**Study Abstract:**
"${abstract}"

Respond only with the JSON object.`;

  // --- Responsible AI Logging ---
  console.log('--- [Sabi Core AI Audit Log] ---');
  console.log('Model:', MODEL_ID);
  console.log('Version:', MODEL_ID); // In OpenAI, model ID serves as version for logging
  console.log('Prompt Sent:\n', userPrompt);
  // ---------------------------------

  try {
    const response = await client.chat.completions.create({
      model: MODEL_ID,
      response_format: { type: "json_object" },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.0, // Keep deterministic for screening
    });

    const rawContent = response.choices[0].message.content;
    const parsedDecision = JSON.parse(rawContent);

    // Validate structure to prevent bad downstream data
    if (!['include', 'exclude', 'uncertain'].includes(parsedDecision.decision) || !parsedDecision.reason) {
      throw new Error('Model returned malformed JSON structure.');
    }

    console.log('AI Decision:', parsedDecision);
    return parsedDecision;

  } catch (error) {
    console.error('[Sabi Core] AI Screening failed:', error.message);
    // Fallback to uncertain if the AI fails, rather than crashing the workflow
    return { 
      decision: 'uncertain', 
      reason: 'AI screening failed to generate a valid response.' 
    };
  }
}

// --- Mock Execution ---
const mockAbstract = "This randomized controlled trial evaluated the effects of a high-protein diet on weight loss in 150 obese adults over 12 months. Results showed a statistically significant decrease in BMI compared to the control group.";

const mockInclusion = [
  "Studies focusing on dietary interventions (e.g., keto, high-protein, caloric restriction)",
  "Human participants aged 18+"
];

const mockExclusion = [
  "Studies focusing purely on pharmacological interventions",
  "Pediatric populations"
];

console.log('Running A1 Screening Assistant...\n');
screenAbstract({
  abstract: mockAbstract,
  inclusionCriteria: mockInclusion,
  exclusionCriteria: mockExclusion
});
