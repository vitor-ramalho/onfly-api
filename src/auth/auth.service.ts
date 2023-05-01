import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  // Injecting dependencies into the constructor
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // Function to sign up a user
  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password); // Hashing the user's password

    try {
      const user = await this.prisma.user.create({
        // Storing user details in the database
        data: {
          email: dto.email,
          password: hash,
        },
      });

      return this.signToken(user.id, user.email); // Generating and returning access token for the user
    } catch (error) {
      if (error.code == 'P2002') {
        // Checking for duplicate entry error
        throw new ForbiddenException('Credentials Taken'); // Throw a forbidden exception if the user already exists
      }
      throw error; // Else, throw any other error
    }
  }

  // Function to log in a user
  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      // Finding user in the database using their email address
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Credentials Incorrect'); // If the user is not found, throw a forbidden exception

    const passwordMatches = await argon.verify(user.password, dto.password); // Verifying the user's hashed password matches the input password

    if (!passwordMatches) throw new ForbiddenException('Credentials Incorrect'); // If the passwords don't match, throw a forbidden exception

    return this.signToken(user.id, user.email); // Generating and returning access token for the user
  }

  // Function to generate an access token for the user
  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId, // Including the user's ID in the token
      email, // Including the user's email in the token
    };

    const secret = this.config.get('JWT_SECRET'); // Fetching the JWT secret from the configuration file
    const token = await this.jwt.signAsync(payload, {
      // Generating a signed token with the payload and secret
      secret: secret,
    });
    return {
      access_token: token, // Returning the generated access token
    };
  }
}
