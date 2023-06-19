import { Command, Ctx, Update, On, Start } from 'nestjs-telegraf';
import { UpdateType as TelegrafUpdateType } from 'telegraf/typings/telegram-types';
import { Context } from '../../../interfaces/context.interface';
import { LINK_ACCOUNTS_SCENE_ID } from '../../../app.constants';
import { UpdateType } from '../../../common/decorators/update-type.decorator';
import { UseGuards } from '@nestjs/common';
import { Markup } from 'telegraf';
// import { AdminTgGuard } from '../../../common/guards/admin.tg.guard';

@Update()
export class NotificationsChannel {
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
    await ctx.reply(
      `Let's rock! Go to your Profile settings in grill.chat application, find "Connect Telegram" button and copy 
      Telegram bot linking message. Than give it to me and I'll link your Grill account with current Telegram account.`,
      Markup.inlineKeyboard([
        Markup.button.url('Go to Grill', `https://grill.chat`)
      ])
    );
  }

  @Command('link')
  async onBlockCommand(
    @UpdateType() updateType: TelegrafUpdateType,
    @Ctx() ctx: Context
  ): Promise<void> {
    await ctx.scene.enter(LINK_ACCOUNTS_SCENE_ID);
  }
  //
  // @Command('u')
  // @UseGuards(AdminTgGuard)
  // async onUnBlockCommand(
  //   @UpdateType() updateType: TelegrafUpdateType,
  //   @Ctx() ctx: Context
  // ): Promise<void> {
  //   await ctx.scene.enter(ADMIN_RESOURCE_UNBLOCK_SCENE_ID);
  // }
  //
  // @Command('s')
  // @UseGuards(AdminTgGuard)
  // async onGetStatusCommand(
  //   @UpdateType() updateType: TelegrafUpdateType,
  //   @Ctx() ctx: Context
  // ): Promise<void> {
  //   await ctx.scene.enter(ADMIN_RESOURCE_STATUS_SCENE_ID);
  // }
  //
  // @Command('ctx')
  // @UseGuards(AdminTgGuard)
  // async onModeratorCommand(
  //   @UpdateType() updateType: TelegrafUpdateType,
  //   @Ctx() ctx: Context
  // ): Promise<void> {
  //   await ctx.scene.enter(MODERATOR_CHANGE_CTX_SCENE_ID);
  // }
  //
  // @Command('me')
  // async onMeCommand(
  //   @UpdateType() updateType: TelegrafUpdateType,
  //   @Ctx() ctx: Context
  // ): Promise<void> {
  //   await ctx.scene.enter(ME_SCENE_ID);
  // }
}
