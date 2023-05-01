import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Expenditure, User } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendExpenditureCreation(user: User, expenditure: Expenditure) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Despesa Cadastrada',
      template: './new-expenditure',
      context: {
        name: user.email,
        description: expenditure.description,
        date: expenditure.date,
        value: expenditure.value,
      },
    });
  }
}
