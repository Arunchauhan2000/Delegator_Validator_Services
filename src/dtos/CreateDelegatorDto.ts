import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateDelegatorDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
