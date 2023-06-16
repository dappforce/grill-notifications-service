import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TelegrafExecutionContext, TelegrafException } from 'nestjs-telegraf';
import { Context } from '../../interfaces/context.interface';
import { xSocialConfig } from '../../config';

@Injectable()
export class AdminTgGuard implements CanActivate {
  constructor(private readonly xSocialConfig: xSocialConfig) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // if (this.xSocialConfig.TG_NO_ADMIN_PROTECTION) return true;
    //
    // const ctx = TelegrafExecutionContext.create(context);
    // const { from } = ctx.getContext<Context>();
    //
    // const isModerator = await this.moderatorService.isModerator(from.id);
    // if (!isModerator) {
    //   throw new TelegrafException(
    //     `Your account is not a moderator yet. Use /me command to get account details.`
    //   );
    // }

    return true;
  }
}
