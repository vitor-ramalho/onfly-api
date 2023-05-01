import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ExpenditureService } from './expenditure.service';
import { GetUser } from '../auth/decorator';
import { CreateExpenditureDto, EditExpenditureDto } from './dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('expenditure')
export class ExpenditureController {
  constructor(private expenditureService: ExpenditureService) {}

  @Post()
  create(@Body() dto: CreateExpenditureDto, @GetUser() user: User) {
    return this.expenditureService.create(dto, user);
  }

  @Get(':id')
  find(@GetUser('id') userId: number, @Param('id') expenditure_id: number) {
    return this.expenditureService.find(userId, expenditure_id);
  }

  @Get()
  findAll(@GetUser('id') userId: number) {
    return this.expenditureService.findAll(userId);
  }

  @Patch(':id')
  edit(
    @Body() dto: EditExpenditureDto,
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) expenditure_id: number,
  ) {
    return this.expenditureService.edit(dto, userId, expenditure_id);
  }

  @Delete(':id')
  delete(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) expenditure_id: number,
  ) {
    return this.expenditureService.remove(userId, expenditure_id);
  }
}
