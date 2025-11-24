import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { SafeUser } from '../types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto
  ): Promise<{ accessToken: string; user: SafeUser }> {
    try {
      const isValid = await this.authService.validateUser(dto);
      if (!isValid) {
        throw new UnauthorizedException();
      }

      return this.authService.login(isValid);
    } catch (error) {
      throw new Error(error);
    }
  }
}
