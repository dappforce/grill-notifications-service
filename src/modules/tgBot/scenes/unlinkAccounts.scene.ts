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
import { UNLINK_ACCOUNTS_SCENE_ID } from '../../../app.constants';
import { Context } from '../../../interfaces/context.interface';

import { Markup } from 'telegraf';
import { TgBotSceneHelpers } from './utils';
import { AccountsLinkService } from '../../accountsLink/services/accountsLink.service';
import { xSocialConfig } from '../../../config';
import { TelegramAccountsLinkService } from '../../accountsLink/services/telegram.accountsLink.service';

@Scene(UNLINK_ACCOUNTS_SCENE_ID)
export class UnlinkAccountsScene {
  constructor(
    private tgBotSceneHelpers: TgBotSceneHelpers,
    private accountsLinkService: AccountsLinkService,
    private telegramAccountsLinkService: TelegramAccountsLinkService,
    private readonly xSocialConfig: xSocialConfig
  ) {}

  @SceneEnter()
  async onSceneEnter(
    @Ctx() ctx: Context,
    @Sender('first_name') firstName: string,
    @Sender('last_name') lastName: string,
    @Sender('username') userName: string,
    @Sender('phone_number') phoneNumber: string,
    @Sender('id') userId: number
  ): Promise<string> {
    let processingMessage = null;
    const substrateAddressForUnlinking = ctx.state.command.args[0];

    if (!substrateAddressForUnlinking) {
      await ctx.reply(
        `⚠️ The address has not been provided along with the command.`
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
    ctx.session.__scenes.state['processingMessageId'] =
      processingMessage.message_id;

    const unlinkResult =
      await this.telegramAccountsLinkService.unlinkTelegramAccountBySubstrateAccountWithAddress(
        {
          substrateAccount: substrateAddressForUnlinking,
          telegramAccountId: userId.toString()
        }
      );

    if (!unlinkResult.success) {
      await ctx.reply(`⚠️ ${unlinkResult.message}`);
      ctx.session.__scenes.state['unlinkError'] = true;
    } else {
      ctx.session.__scenes.state['unlinkedSubstrateAccount'] =
        substrateAddressForUnlinking;
      ctx.session.__scenes.state['unlinkError'] = false;
    }

    await ctx.deleteMessage(processingMessage.message_id);
    delete ctx.session.__scenes.state['processingMessageId'];
    await ctx.scene.leave();
    return;
  }

  @Action('cancel_processing')
  async onStopCommand(@Ctx() ctx: Context): Promise<void> {
    await ctx.answerCbQuery();
    delete ctx.session.__scenes.state['unlinkedSubstrateAccount'];
    if (ctx.session.__scenes.state['processingMessageId']) {
      await ctx.deleteMessage(
        ctx.session.__scenes.state['processingMessageId']
      );
      delete ctx.session.__scenes.state['processingMessageId'];
    }
    ctx.session.__scenes.state['throwCancel'] = true;
    await ctx.scene.leave();
  }

  @SceneLeave()
  async onSceneLeave(@Ctx() ctx: Context): Promise<void> {
    if (
      ctx.session.__scenes.state['throwCancel'] ||
      ctx.session.__scenes.state['unlinkError']
    )
      return;
    if (ctx.session.__scenes.state['processingMessageId']) {
      await ctx.deleteMessage(
        ctx.session.__scenes.state['processingMessageId']
      );
      delete ctx.session.__scenes.state['processingMessageId'];
    }
    if (ctx.session.__scenes.state['unlinkedSubstrateAccount']) {
      await ctx.reply(
        `✅ Account ${ctx.session.__scenes.state['unlinkedSubstrateAccount']} unlinked successfully.`
      );
    } else {
      await ctx.reply(`✅Accounts unlinked successfully.`);
    }
  }
}
