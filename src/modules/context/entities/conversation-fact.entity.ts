
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Chat } from '../../chats/entities/chat.entity.js';
import { ChatMessage } from '../../chats/entities/chat-message.entity.js';

@Entity('conversation_facts')
@Check(
  'CHK_conversation_facts_scope',
  '"userId" IS NOT NULL OR "chatId" IS NOT NULL',
)
@Index(
  'UQ_conversation_facts_user_key',
  ['userId', 'key'],
  {
    unique: true,
    where: '"userId" IS NOT NULL AND "chatId" IS NULL',
  },
)
@Index(
  'UQ_conversation_facts_chat_key',
  ['chatId', 'key'],
  {
    unique: true,
    where: '"chatId" IS NOT NULL',
  },
)
export class ConversationFact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  userId: string | null;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  chatId: string | null;

  @ManyToOne(() => Chat, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chat: Chat | null;

  @Column({
    type: 'varchar',
    length: 100,
  })
  key: string;

  @Column({
    type: 'text',
  })
  value: string;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  sourceMessageId: string | null;

  @ManyToOne(() => ChatMessage, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'sourceMessageId' })
  sourceMessage: ChatMessage | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
