import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class BaseController {
  @Get()
  async access() {}
}
