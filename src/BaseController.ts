import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('/')
export class BaseController {
  @Get('*')
  async access(@Req() request: Request) {
    console.log(request.path);
  }
}
