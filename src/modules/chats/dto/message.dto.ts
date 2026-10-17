import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";

export class MessageDto {
  @IsOptional()
  @IsUUID()
  chatId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  message: string;
}