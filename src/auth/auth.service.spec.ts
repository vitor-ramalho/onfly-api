import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ForbiddenException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as pactum from 'pactum';
import * as argon from 'argon2';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let mockUser;
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();

    await app.listen(3335);

    prismaService = app.get(PrismaService);

    jwtService = new JwtService({
      secret: 'test-secret',
    });
    configService = new ConfigService({
      JWT_SECRET: 'test-secret',
    });
    authService = new AuthService(prismaService, jwtService, configService);
    mockUser = await prismaService.user.create({
      data: {
        email: 'test@example.com',
        password: await argon.hash('password'),
      },
    });

    pactum.request.setBaseUrl('http://localhost:3335');
  });

  afterAll(async () => {
    await prismaService.user.deleteMany();
  });

  describe('signup', () => {
    it('should create a new user', async () => {
      const authDto: AuthDto = {
        email: 'newuser@example.com',
        password: 'password',
      };

      const response = await authService.signup(authDto);

      expect(response).toHaveProperty('access_token');
    });

    it('should throw a ForbiddenException for an existing user', async () => {
      const authDto: AuthDto = {
        email: mockUser.email,
        password: 'password',
      };

      try {
        await authService.signup(authDto);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('signin', () => {
    it('should return a token for a valid user', async () => {
      const authDto: AuthDto = {
        email: mockUser.email,
        password: 'password',
      };

      const response = await authService.signin(authDto);

      expect(response.access_token).toBeDefined();
    });

    it('should throw a ForbiddenException for an invalid email', async () => {
      const authDto: AuthDto = {
        email: 'invalid@example.com',
        password: 'password',
      };

      try {
        await authService.signin(authDto);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });

    it('should throw a ForbiddenException for an invalid password', async () => {
      const authDto: AuthDto = {
        email: mockUser.email,
        password: 'invalid',
      };

      try {
        await authService.signin(authDto);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('signToken', () => {
    it('should return an access token', async () => {
      const userId = 1;
      const email = 'test@example.com';
      const token = await authService.signToken(userId, email);

      expect(token.access_token).toBeDefined();
    });
  });
});
