import { Command, Ctx, Update, On, Start } from 'nestjs-telegraf';
import { UpdateType as TelegrafUpdateType } from 'telegraf/typings/telegram-types';
import { Context } from '../../../interfaces/context.interface';
import {
  LINK_ACCOUNTS_SCENE_ID,
  LINK_STATUS_SCENE_ID,
  UNLINK_ACCOUNTS_SCENE_ID
} from '../../../app.constants';
import { UpdateType } from '../../../common/decorators/update-type.decorator';
import { UseGuards } from '@nestjs/common';
import { Markup } from 'telegraf';
import { xSocialConfig } from '../../../config';
// import { AdminTgGuard } from '../../../common/guards/admin.tg.guard';

@Update()
export class NotificationsChannel {
  constructor(private readonly xSocialConfig: xSocialConfig) {}

  // @On('message')
  // async onChatMessage(@Ctx() ctx: Context) {
  //   console.log('ON message');
  //   console.dir(ctx.message, { depth: null });
  // }
  //
  // @On('chat_member')
  // async onNewMember(@Ctx() ctx: Context) {
  //   console.log('ON new chat member');
  // }

  @Start()
  async onStart(
    @UpdateType() updateType: TelegrafUpdateType,
    @Ctx() ctx: Context
  ) {
    await ctx.scene.enter(LINK_ACCOUNTS_SCENE_ID);
  }

  @Command('link')
  async onLinkStatusCommand(
    @UpdateType() updateType: TelegrafUpdateType,
    @Ctx() ctx: Context
  ): Promise<void> {
    await ctx.scene.enter(LINK_STATUS_SCENE_ID);
  }
}
