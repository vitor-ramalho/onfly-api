import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class EditExpenditureDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @IsOptional()
  value?: number;
}
