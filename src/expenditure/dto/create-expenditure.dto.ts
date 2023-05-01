import {
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxDate,
  MaxLength,
} from 'class-validator';

export class CreateExpenditureDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(191)
  description: string;

  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  value: number;
}
