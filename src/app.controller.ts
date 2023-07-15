import {
  Controller,
  Get,
  Request,
  Post,
  UseGuards,
  HttpStatus,
  Body,
} from '@nestjs/common';
import {
  LocalAuthGuard,
  AuthService,
  JwtAuthGuard,
  BasicAuthGuard,
} from './auth';
import { UsersService } from './users';

@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @Get(['', 'ping'])
  healthCheck(): any {
    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    };
  }

  @Post('api/auth/login')
  async login(@Body() body) {
    const { name, password } = body;

    const candidate = await this.userService.findOneByName(name);

    if (candidate.password !== password) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
      };
    }

    return this.authService.login(candidate);
  }

  @Post('api/auth/signup')
  async signup(@Body() body) {
    const candidate = await this.userService.findOneByName(body.name);
    if (candidate) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'User already exists',
      };
    }
    const user = await this.userService.createOne(body);
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/profile')
  async getProfile(@Request() req) {
    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: {
        user: req.user,
      },
    };
  }
}
