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
import { xSocialConfig } from '../../../config';
import { TelegramAccountsLinkService } from '../../accountsLink/services/telegram.accountsLink.service';

@Scene(LINK_ACCOUNTS_SCENE_ID)
export class LinkAccountsScene {
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

    console.log(ctx.state.command.args)
    let processingMessage = null;
    const linkingTmpIdOrAddress = ctx.state.command.args[0];

    if (!linkingTmpIdOrAddress) {
      await ctx.reply(
        `Let's rock! Go to your Profile settings in grill.chat application, find "Connect Telegram" button and copy 
        Telegram bot linking message. Than give it to me and I'll link your Grill account with current Telegram account.`,
        Markup.inlineKeyboard([
          Markup.button.url(
            'Go to Grill',
            this.xSocialConfig.TELEGRAM_BOT_GRILL_REDIRECTION_HREF
          )
        ])
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

    const accountsLink =
      await this.telegramAccountsLinkService.processTemporaryLinkingIdOrAddress({
        telegramAccountData: {
          accountId: userId.toString(),
          phoneNumber: phoneNumber,
          userName: userName,
          firstName: firstName,
          lastName: lastName
        },
        linkingIdOrAddress: linkingTmpIdOrAddress
      });

    ctx.session.__scenes.state['linkedSubstrateAccount'] =
      accountsLink.substrateAccountId;

    await ctx.deleteMessage(processingMessage.message_id);
    delete ctx.session.__scenes.state['processingMessageId'];
    await ctx.scene.leave();
    return;
  }

  @Action('cancel_processing')
  async onStopCommand(@Ctx() ctx: Context): Promise<void> {
    await ctx.answerCbQuery();
    delete ctx.session.__scenes.state['linkedSubstrateAccount'];
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
    if (ctx.session.__scenes.state['throwCancel']) return;
    if (ctx.session.__scenes.state['processingMessageId']) {
      await ctx.deleteMessage(
        ctx.session.__scenes.state['processingMessageId']
      );
      delete ctx.session.__scenes.state['processingMessageId'];
    }
    if (ctx.session.__scenes.state['linkedSubstrateAccount']) {
      await ctx.reply(
        `✅ Account linked successfully with Grill account ${ctx.session.__scenes.state['linkedSubstrateAccount']}.`
      );
    } else {
      await ctx.reply(`✅Accounts linked successfully.`);
    }
  }
}
