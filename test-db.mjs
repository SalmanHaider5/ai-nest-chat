import pg from "pg";

const { Client } = pg;

const client = new Client({
  host: "127.0.0.1",
  port: 5432,
  user: "ai_chat",
  password: "ai_chat_password",
  database: "ai_chat",
});

try {
  await client.connect();

  const result = await client.query(
    "SELECT current_user, current_database()",
  );

  await client.end();
} catch (error) {
  console.error("Database connection failed:", error);
}