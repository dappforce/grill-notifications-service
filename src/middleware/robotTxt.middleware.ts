import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RobotTxtMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.type('text/plain');
    res.send('User-agent: *\nDisallow: /');
  }
}
