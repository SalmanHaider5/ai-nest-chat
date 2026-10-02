import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Chat } from "./chat.entity.js";

@Entity("chat_messages")
export class ChatMessage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "varchar",
    length: 20,
  })
  role: "user" | "assistant";

  @Column({
    type: "text",
  })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(
    "Chat",
    "messages",
    {
      onDelete: "CASCADE",
    },
  )
  chat: Chat;
}