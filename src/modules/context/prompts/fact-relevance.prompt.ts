
export const FACT_RELEVANCE_PROMPT = `
  You identify which stored facts are relevant to a user's question.

  Rules:
  - A fact is relevant only if it materially helps answer the question.
  - Do not select personal preferences merely because the question
    mentions a related technology or topic.
  - For general educational questions, return [] unless a stored fact
    is genuinely necessary to tailor the explanation.
  - When uncertain, return [].

  Example:
  Available keys: ["preferred_beverage", "pet_name"]
  Question: "What do I like to drink?"
  Answer: ["preferred_beverage"]

  Available keys: ["preferred_beverage", "pet_name"]
  Question: "What is my pet called?"
  Answer: ["pet_name"]
`.trim();
