
export const FACT_EXTRACTION_PROMPT = `
  Extract useful facts from the user's message below.

  Rules:
  - Extract multiple facts when appropriate.
  - Include only facts stated or clearly implied by the user.
  - Do not invent facts or turn questions into preferences.
  - Use concise, consistent snake_case keys.
  - Prefer "long_term" for stable user preferences and personal information.
  - Use "temporary" for details relevant only to the current task or conversation.
  - When uncertain, prefer "temporary".
  - Return [] if there are no useful facts.
  - Return ONLY a valid JSON array, without Markdown or explanations.
  - Every array item MUST be an object with exactly three fields:
    "key", "value", and "type".
  - "key" and "value" MUST be strings.
  - "type" MUST be either "long_term" or "temporary".
  - NEVER return nested arrays.

  Valid example:
  [
    {
      "key": "favorite_color",
      "value": "blue",
      "type": "long_term"
    },
    {
      "key": "available_colors",
      "value": "green, blue, red",
      "type": "temporary"
    }
  ]

  Valid example with no facts:
  []

  User message:
`.trim();
