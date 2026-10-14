export const FACT_EXTRACTION_PROMPT = `
  Extract explicit, useful facts about the user from the message below.

  Rules:
  - Extract multiple facts when appropriate.
  - Include only facts stated or clearly implied by the user.
  - Do not invent facts or turn questions into preferences.
  - Use concise, consistent snake_case keys.
  - Return an empty array if there are no useful facts.
  - Return ONLY a valid JSON array.
  - Each item must have exactly two fields: "key" and "value".
  - Both "key" and "value" must be strings.

  Example:
  Message: "My favorite color is green and I prefer MySQL."
  Output:
  [
    { "key": "favorite_color", "value": "green" },
    { "key": "preferred_database", "value": "MySQL" }
  ]

  User message:
`;
