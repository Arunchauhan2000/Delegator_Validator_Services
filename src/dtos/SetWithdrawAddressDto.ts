import { IsEmail, IsString, Matches } from 'class-validator';

export class SetWithdrawAddressDto {
  @IsEmail()
  email!: string;
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Address Format. Should be 0x...' })
  withdrawAddress!: string;
}
