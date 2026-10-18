import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray } from 'class-validator';
import { UserRole, Division, SecurityRank } from '@patrol/types';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsEnum(Division)
  @IsOptional()
  division?: Division;

  @IsEnum(SecurityRank)
  @IsOptional()
  securityRank?: SecurityRank | null;

  @IsNumber()
  @IsOptional()
  workingHoursPerDay?: number;

  @IsNumber()
  @IsOptional()
  gajiPokok?: number;

  @IsNumber()
  @IsOptional()
  tunjangan?: number;

  @IsNumber()
  @IsOptional()
  lemburPerJam?: number;

  @IsNumber()
  @IsOptional()
  potonganBpjs?: number;

  @IsNumber()
  @IsOptional()
  potonganAlpa?: number;

  @IsNumber()
  @IsOptional()
  potonganLupaAbsen?: number;

  @IsString()
  @IsOptional()
  siteId?: string | null;

  @IsArray()
  @IsOptional()
  multiSiteIds?: string[];

  @IsString()
  @IsOptional()
  avatarUrl?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
