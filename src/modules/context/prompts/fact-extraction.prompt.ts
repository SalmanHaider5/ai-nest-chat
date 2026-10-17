
export const FACT_EXTRACTION_PROMPT = `
  Extract useful facts from the user's message below.

  Rules:
  - Extract multiple facts when appropriate.
  - Include only facts stated or clearly implied by the user.
  - Do not invent facts or turn questions into preferences.
  - Use concise, consistent snake_case keys.
  - Every fact must have a type: "long_term" or "temporary".

  LONG-TERM FACTS:
  Use "long_term" only for information that is likely to remain
  useful across multiple conversations, such as:
  - Stable personal information: city of residence, pet name.
  - Explicit preferences: favorite color, preferred database,
    preferred programming language.
  - Ongoing interests or hobbies: hiking, reading.
  - Persistent professional information: occupation, core skills.

  TEMPORARY FACTS:
  Use "temporary" for information tied to a particular task,
  project, question, or limited period, such as:
  - Available options for the current task.
  - Technologies being considered for a specific project.
  - Temporary plans, deadlines, or troubleshooting details.
  - Values, lists, or constraints that apply only to the current request.

  CLASSIFICATION GUIDELINES:
  - Do not classify a fact as long-term merely because it is phrased
    as a statement.
  - A list of options is not automatically a user preference.
  - For example, "The available colors are green, blue, and red"
    should be temporary unless the user explicitly says this is a
    persistent list.
  - "My favorite color is blue" should be long_term.
  - "For this task, use PostgreSQL" should be temporary.
  - "I prefer PostgreSQL" should be long_term.
  - When uncertain, prefer "temporary".
  - Extract only information useful for future responses.
  - Return [] if there are no useful facts.

  OUTPUT FORMAT:
  - Return ONLY a valid JSON array, without Markdown or explanations.
  - Every item MUST contain exactly three fields: "key", "value",
    and "type".
  - "key" and "value" MUST be strings.
  - "type" MUST be either "long_term" or "temporary".
  - NEVER return nested arrays.

  Example:
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

  Example with no useful facts:
  []

  User message:
`.trim();
