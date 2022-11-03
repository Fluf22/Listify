import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { Token } from './models/token.model';
import { PasswordService } from '../password.service';
import { SignupDto } from './dto/signup.dto';
import { User } from '../users/models/user.model';
import { JwtDto } from './dto/jwt.dto';
import { MAIL_WORKER, prismaUserProfileIncludeQuery } from '../constants';
import { ClientProxy } from '@nestjs/microservices';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private configService: ConfigService,
    private passwordService: PasswordService,
    @Inject(MAIL_WORKER) private mailWorker: ClientProxy,
  ) {}

  async createUser(signupDto: SignupDto): Promise<void> {
    const hashedPassword = await this.passwordService.hashPassword(
      signupDto.password,
    );

    try {
      const user = await this.prismaService.user.create({
        data: {
          ...signupDto,
          password: hashedPassword,
          role: 'USER',
        },
      });

      await this.prismaService.userEmailConfirm.create({
        data: {
          userId: user.id,
        },
      });
      this.mailWorker.emit('confirm.email', user.email);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(`Email ${signupDto.email} already used.`);
      } else {
        throw new Error(e);
      }
    }
  }

  getUserFromToken(token: string): Promise<User> {
    const id = this.jwtService.decode(token)['sub'];
    return this.prismaService.user.findFirst({
      where: { deletedAt: null, id },
      include: prismaUserProfileIncludeQuery,
    });
  }

  async validateUser(email: string): Promise<User> {
    return await this.usersService.findUser(email);
  }

  async generateTokens(payload: JwtPayload): Promise<Token> {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  private generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRY'),
    });
  }

  async refreshToken(token: string) {
    try {
      const { sub } = this.jwtService.verify<JwtDto>(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      return this.generateTokens({
        sub,
      });
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async initResetPasswordFlow(email: string) {
    const user = await this.prismaService.user.findFirst({
      where: { deletedAt: null, email },
    });
    if (!user) {
      throw new BadRequestException('email_not_found');
    }

    await this.prismaService.userPasswordReset.create({
      data: {
        userId: user.id,
      },
    });
    this.mailWorker.emit('reset.password', email);
  }

  async confirmEmail(userId: string, token: string): Promise<void> {
    const userWithEmailConfirmToken = await this.prismaService.user.findFirst({
      where: { deletedAt: null, id: userId },
      include: { UserEmailConfirm: { select: { token: true } } },
    });

    if (
      !userWithEmailConfirmToken ||
      userWithEmailConfirmToken.emailConfirmed ||
      userWithEmailConfirmToken.UserEmailConfirm.token !== token
    ) {
      throw new BadRequestException('confirm_email_failure');
    }

    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        emailConfirmed: true,
        UserEmailConfirm: {
          update: {
            deletedAt: new Date(),
          },
        },
      },
    });
  }
}
