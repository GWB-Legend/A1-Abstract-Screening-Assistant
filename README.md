# A1-Abstract-Screening-Assistant
Abstract Screening Assistant
How to Run
Navigate to the A1 directory.
Install dependencies: npm install
Add your OpenAI API key: export OPENAI_API_KEY="sk-your-key-here"
Run the module: node index.js
Architecture & Responsible AI
Prompt Design: The prompt explicitly instructs the model to rely only on the provided criteria and output strict JSON. This minimizes hallucinations.
Structured Output: Utilizes OpenAI's response_format: { type: "json_object" } feature (available on gpt-4o-mini and gpt-4o) to guarantee valid JSON parsing without fragile regex matching.
Responsible AI Logging: The function strictly logs the exact model, version (model ID), and the full prompt sent to the API to satisfy audit requirements.
Limitations & Next Steps
With more time, I would write these logs to a PostgreSQL table via Prisma (tying it to the Sabi Core backend stack) rather than console.log, and implement token counting to track costs per screening decision.
