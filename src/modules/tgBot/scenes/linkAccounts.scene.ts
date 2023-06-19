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
import { LINK_ACCOUNTS_SCENE_ID } from '../../../app.constants';
import { Context } from '../../../interfaces/context.interface';

import { Markup } from 'telegraf';
import { TgBotSceneHelpers } from './utils';
import { AccountsLinkService } from '../../accountsLink/services/accountsLink.service';

@Scene(LINK_ACCOUNTS_SCENE_ID)
export class LinkAccountsScene {
  constructor(
    private tgBotSceneHelpers: TgBotSceneHelpers,
    private accountsLinkService: AccountsLinkService
  ) {}

  @SceneEnter()
  async onSceneEnter(
    @Ctx() ctx: Context,
    @Sender('first_name') firstName: string,
    @Sender('last_name') lastName: string,
    @Sender('username') userName: string,
    @Sender('id') userId: number
  ): Promise<string> {
    let linkingMessage = null;
    let processingMessage = null;
    linkingMessage = ctx.state.command.args[0];

    if (!linkingMessage) {
      await ctx.reply(
        '⚠️ The account ID has not been provided along with the command.'
      );
      await ctx.scene.leave();
      return;
    }

    processingMessage = await ctx.reply(
      '🕣 Processing ...',
      Markup.inlineKeyboard([
        Markup.button.callback('❎ Cancel', 'cancel_processing')
      ])
    );

    await this.accountsLinkService.parseAndVerifySubstrateAccountFromSignature({
      tgAccountId: userId,
      linkingMessage: linkingMessage
    });

    await ctx.deleteMessage(processingMessage.message_id);
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
    if (ctx.session.__scenes.state['reasonSelectionMessage']) {
      await ctx.deleteMessage(
        ctx.session.__scenes.state['reasonSelectionMessage']
      );
      delete ctx.session.__scenes.state['reasonSelectionMessage'];
    }
    await ctx.scene.leave();
  }

  @SceneLeave()
  async onSceneLeave(@Ctx() ctx: Context): Promise<void> {
    await ctx.reply('Accounts linked');
  }
}
