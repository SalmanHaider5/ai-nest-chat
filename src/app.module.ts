import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration.js";
import { HealthModule } from "./modules/health/health.module.js";
import { ChatsModule } from "./modules/chats/chats.module.js";
import { DatabaseModule } from "./database/database.module.js";
import { ContextModule } from './modules/context/context.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    HealthModule,
    ChatsModule,
    ContextModule,
  ],
})
export class AppModule {}