import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    // Call the parent constructor with the JWT validation options.
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  // A function that gets called when a JWT token is presented for validation.
  async validate(payload: { sub: number; email: string }) {
    // Retrieve the user object from the database using Prisma ORM.
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    // Remove the password field from the user object for security reasons.
    delete user.password;

    // Return the user object to the Passport middleware for further processing.
    return user;
  }
}
