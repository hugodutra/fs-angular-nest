import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<{ accesstToken: string }> {
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
