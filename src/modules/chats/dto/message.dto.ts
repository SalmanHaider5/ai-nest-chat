import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class MessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  message: string;
}