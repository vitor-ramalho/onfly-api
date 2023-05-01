import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenditureDto, EditExpenditureDto } from './dto';
import { MailService } from 'src/mail/mail.service';
import { User } from '@prisma/client';

@Injectable()
export class ExpenditureService {
  constructor(
    private prisma: PrismaService, // Dependency injection
    private mailService: MailService,
  ) {}

  async create(dto: CreateExpenditureDto, user: User) {
    // Create a new Expenditure
    try {
      const expenditure = await this.prisma.expenditure.create({
        // Call the prisma service to create a new expenditure record
        data: {
          description: dto.description,
          value: dto.value,
          date: dto.date,
          user_id: user.id,
        },
      });

      const currentDate = new Date();

      if (expenditure.date > currentDate) {
        // Check if the date of expenditure is after current date. If yes, throw an error.
        throw new ForbiddenException('');
      }

      await this.mailService.sendExpenditureCreation(user, expenditure); // Send email notification to user after creating the expenditure.

      return expenditure;
    } catch (error) {
      throw error; // Throw error if there's any.
    }
  }

  async find(userId: number, expenditure_id: number) {
    // Find an expenditure by userId and expenditure id
    try {
      const expenditure = await this.prisma.expenditure.findUnique({
        where: {
          id: expenditure_id,
        },
      });

      if (!expenditure) {
        // Check if expenditure exists or not. If not, throw a 404 Not Found error.
        throw new HttpException('Expenditure not found', HttpStatus.NOT_FOUND);
      }

      const checkUser = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (expenditure.user_id !== checkUser.id) {
        // Check if expenditure belongs to the user or not. If not, throw an error
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }

      return expenditure; // Return the expenditure object.
    } catch (error) {
      throw error; // Throw error if there's any.
    }
  }

  async findAll(userId: number) {
    // Find all expenditures by userId
    try {
      const expenditures = await this.prisma.expenditure.findMany({
        where: {
          user_id: userId,
        },
      });

      return expenditures; // Return array of expenditures.
    } catch (error) {
      throw error; // Throw error if there's any.
    }
  }

  async edit(dto: EditExpenditureDto, userId: number, expenditure_id: number) {
    // Edit a particular expenditure using its id
    try {
      const expenditure = await this.prisma.expenditure.update({
        where: {
          id: expenditure_id,
        },
        data: {
          description: dto.description,
          value: dto.value,
        },
      });

      const checkUser = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (expenditure.user_id !== checkUser.id) {
        // Check if expenditure belongs to the user or not. If not, throw an error.
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }

      return expenditure; // Return the updated expenditure object.
    } catch (error) {
      throw error; // Throw error if there's any.
    }
  }

  async remove(userId: number, expenditure_id: number) {
    // Remove a particular expenditure using its id
    try {
      const expenditure = await this.prisma.expenditure.delete({
        where: {
          id: expenditure_id,
        },
      });

      const checkUser = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (expenditure.user_id !== checkUser.id) {
        // Check if expenditure belongs to the user or not. If not, throw an error.
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }

      return { message: 'Expenditure deleted' }; // Return a success message object.
    } catch (error) {
      throw error; // Throw error if there's any.
    }
  }
}
