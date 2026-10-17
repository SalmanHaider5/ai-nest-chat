import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ChatMessage } from "./chat-message.entity.js";

@Entity("chats")
export class Chat {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "varchar",
    length: 200,
  })
  title: string;

  @Column({
    type: "text",
    nullable: true,
  })
  summary: string | null;

  @Column({
    type: "uuid",
    nullable: true,
  })
  summaryThroughMessageId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => ChatMessage,
    (message) => message.chat,
  )
  messages: ChatMessage[];
}