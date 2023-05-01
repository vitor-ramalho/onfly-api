import { Module } from '@nestjs/common';
import { ExpenditureService } from './expenditure.service';
import { ExpenditureController } from './expenditure.controller';
import { MailModule } from 'src/mail/mail.module';

@Module({
  providers: [ExpenditureService],
  controllers: [ExpenditureController],
  imports: [MailModule],
})
export class ExpenditureModule {}
