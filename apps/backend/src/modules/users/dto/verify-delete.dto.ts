import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyDeleteDto {
  @IsString()
  @IsNotEmpty()
  adminId!: string;

  @IsString()
  @IsNotEmpty()
  targetUserId!: string;

  @IsString()
  @IsNotEmpty()
  passwordConfirm!: string;
}
