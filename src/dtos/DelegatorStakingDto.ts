import { IsString, IsNotEmpty } from 'class-validator';

export class DelegatorStakingDto {
  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  validatorOperatorAddress!: string;

  @IsString()
  @IsNotEmpty()
  amount!: string;
}
