import "dotenv/config";
import { DataSource } from "typeorm";
import { Chat } from "../modules/chats/entities/chat.entity.js";
import { ChatMessage } from "../modules/chats/entities/chat-message.entity.js";

export default new DataSource({
  type: "postgres",

  host: process.env.DATABASE_HOST ?? "localhost",
  port: Number(process.env.DATABASE_PORT ?? 5432),

  username: process.env.DATABASE_USERNAME ?? "ai_chat",
  password: process.env.DATABASE_PASSWORD ?? "ai_chat_password",
  database: process.env.DATABASE_NAME ?? "ai_chat",

  entities: [Chat, ChatMessage],

  migrations: ["src/database/migrations/*.ts"],

  synchronize: false,
});