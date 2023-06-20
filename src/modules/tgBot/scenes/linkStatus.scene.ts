import {
  Command,
  Ctx,
  Hears,
  Scene,
  SceneEnter,
  SceneLeave,
  Message,
  On,
  Action,
  Sender
} from 'nestjs-telegraf';
import {
  LINK_ACCOUNTS_SCENE_ID,
  LINK_STATUS_SCENE_ID,
  UNLINK_ACCOUNTS_SCENE_ID
} from '../../../app.constants';
import { Context } from '../../../interfaces/context.interface';

import { Markup } from 'telegraf';
import { TgBotSceneHelpers } from './utils';
import { AccountsLinkService } from '../../accountsLink/services/accountsLink.service';

@Scene(LINK_STATUS_SCENE_ID)
export class LinkStatusScene {
  constructor(
    private tgBotSceneHelpers: TgBotSceneHelpers,
    private accountsLinkService: AccountsLinkService
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

    const links = await this.accountsLinkService.findAllActiveByTgAccountId(
      userId
    );
    await ctx.deleteMessage(processingMessage.message_id);

    if (!links || links.length === 0) {
      await ctx.reply(
        `You don't have linked Grill accounts with this Telegram account.`
      );
    } else {
      await ctx.reply(
        `This Telegram account is linked with such Grill accounts:\n${links.map((link) => `- ${link.substrateAccountId};\n`)}`
      );
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
