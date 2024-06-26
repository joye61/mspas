import { Controller, Get, HttpStatus, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { Parser } from "./Parser";
import { ConfigService } from "@nestjs/config";

@Controller("/")
export class BaseController {
  constructor(
    private config: ConfigService,
    private parser: Parser,
  ) {}

  @Get("*")
  async access(@Req() request: Request, @Res() response: Response) {
    const brand = this.config.get<string>("BRAND");
    response.set("X-Powered-By", brand);

    const file = await this.parser.search(request.path);
    if (file === null) {
      response.status(HttpStatus.NOT_FOUND);
      response.type("html");
      response.end();
      return;
    }

    response.status(HttpStatus.OK);
    response.sendFile(file);
  }
}
