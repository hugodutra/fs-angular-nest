import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { SafeUser } from '../types';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ accessToken: string; user: SafeUser }> {
    const isValid = await this.authService.validateUser(dto);
    if (!isValid) {
      throw new UnauthorizedException();
    }

    const { accessToken, refreshToken, user } = await this.authService.login(
      isValid
    );

    res.cookie('refreshToken', refreshToken, {
      maxAge: this.authService.refreshTokenMaxAgeMs,
      path: '/',
    });

    return { accessToken, user };
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ accessToken: string; user: SafeUser }> {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const {
      accessToken,
      refreshToken: rotated,
      user,
    } = await this.authService.refresh(refreshToken);

    res.cookie('refreshToken', rotated, {
      maxAge: this.authService.refreshTokenMaxAgeMs,
      path: '/',
    });

    return { accessToken, user };
  }
}
