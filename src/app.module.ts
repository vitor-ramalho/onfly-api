import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ExpenditureModule } from './expenditure/expenditure.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    AuthModule,
    ExpenditureModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
