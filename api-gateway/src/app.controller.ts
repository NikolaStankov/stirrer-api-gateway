import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';

@Controller()
export class AppController {
  @Get('public')
  public() {
    return 'This is a public route';
  }

  @Get('protected')
  @UseGuards(AuthGuard('jwt'))
  protected() {
    return 'This is a protected route';
  }

  @Get('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin')
  adminOnly() {
    return 'This route is for admins only';
  }
}
