import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { xSocialConfig } from '../../config';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGqlGuard implements CanActivate {
  constructor(private readonly xSocialConfig: xSocialConfig) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.xSocialConfig.API_NO_ADMIN_PROTECTION) return true;

    const gqlCtx = GqlExecutionContext.create(context).getContext();
    if (!gqlCtx.headers.authorization) {
      throw new HttpException(
        'Unauthorized request. Auth token is required.',
        HttpStatus.UNAUTHORIZED
      );
    }
    const authPayload = await this.validateToken(gqlCtx.headers.authorization);
    if (authPayload.admin) return true;
    return false;
  }

  async validateToken(auth: string): Promise<{ admin: boolean } | never> {
    if (auth.split(' ')[0] !== 'Bearer') {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    const token = auth.split(' ')[1];

    try {
      return jwt.verify(token, this.xSocialConfig.GQL_API_AUTH_SECRET) as {
        admin: boolean;
      };
    } catch (err: any) {
      const message = 'Token error: ' + (err.message || err.name);
      throw new HttpException(message, HttpStatus.UNAUTHORIZED);
    }
  }
}
