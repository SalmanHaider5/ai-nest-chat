import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration.js";
import { HealthModule } from "./modules/health/health.module.js";
import { ChatsModule } from "./modules/chats/chats.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    HealthModule,
    ChatsModule,
  ],
})
export class AppModule {}