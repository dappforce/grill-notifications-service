import { Ctx, Scene, SceneEnter, Action, Sender } from 'nestjs-telegraf';
import { LINK_STATUS_SCENE_ID } from '../../../app.constants';
import { Context } from '../../../interfaces/context.interface';

import { Markup } from 'telegraf';
import { TgBotSceneHelpers } from './utils';
import { TelegramAccountsLinkService } from '../../accountsLink/services/telegram.accountsLink.service';

@Scene(LINK_STATUS_SCENE_ID)
export class StatusScene {
  constructor(
    private tgBotSceneHelpers: TgBotSceneHelpers,
    private telegramAccountsLinkService: TelegramAccountsLinkService
  ) {}

  @SceneEnter()
  async onSceneEnter(
    @Ctx() ctx: Context,
    @Sender('id') userId: number
  ): Promise<string> {
    let processingMessage = null;

    processingMessage = await ctx.reply(
      '🕣 Processing ...',
      Markup.inlineKeyboard([
        Markup.button.callback('❎ Cancel', 'cancel_processing')
      ])
    );

    const linksPersonal =
      await this.telegramAccountsLinkService.findAllActiveByTgAccountId({
        accountId: userId.toString(),
        following: false
      });
    const linksFollowing =
      await this.telegramAccountsLinkService.findAllActiveByTgAccountId({
        accountId: userId.toString(),
        following: true
      });
    await ctx.deleteMessage(processingMessage.message_id);

    if (linksPersonal.length === 0 && linksFollowing.length === 0) {
      await ctx.reply(
        `You don't have any linked Grill accounts with this Telegram account.`
      );
    } else {
      let messageText = '';
      if (linksPersonal.length > 0)
        messageText += `🙋‍ Your Grill account:\n   🔹 ${linksPersonal[0].substrateAccountId}\n\n`;

      if (linksFollowing.length > 0)
        messageText += `👀 Followed Grill accounts:${linksFollowing.map(
          (link) => `\n   🔹 ${link.substrateAccountId}`
        )}`;
      await ctx.reply(messageText.replace(/\,/g, ''));
    }
    await ctx.scene.leave();
    return;
  }

  @Action('cancel_processing')
  async onStopCommand(@Ctx() ctx: Context): Promise<void> {
    await ctx.answerCbQuery();
    if (ctx.session.__scenes.state['processingMessageId']) {
      await ctx.deleteMessage(
        ctx.session.__scenes.state['processingMessageId']
      );
      delete ctx.session.__scenes.state['processingMessageId'];
    }
    await ctx.scene.leave();
  }
}
