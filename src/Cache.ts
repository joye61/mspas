import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Parser } from "./Parser";

@Injectable()
export class Cache {
  constructor(private parser: Parser) {}

  @Cron("0 0 0 * * *")
  async handleCache() {
    await this.parser.autoClear();
  }
}
