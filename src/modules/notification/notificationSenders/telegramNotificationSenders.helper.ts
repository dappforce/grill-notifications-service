import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { GrillNotificationsBotName } from '../../../app.constants';
import { Markup, Telegraf } from 'telegraf';
import { TelegrafContext } from '../../../interfaces/context.interface';
import { NotificationEventDataForSubstrateAccountDto } from '../dto/notificationEventTriggerData.dto';
import { AccountNotificationData } from '../dto/types';
import { EventName } from '../../dataProviders/dto/squid/squidEvents.dto';
import { CommonUtils } from '../../../common/utils/common.util';
import { InlineKeyboardMarkup } from 'typegram';
import { xSocialConfig } from '../../../config';

@Injectable()
export class TelegramNotificationSendersHelper {
  constructor(
    @InjectBot(GrillNotificationsBotName)
    private bot: Telegraf<TelegrafContext>,
    private commonUtils: CommonUtils,
    private readonly xSocialConfig: xSocialConfig
  ) {}

  async sendMessageTelegramBot(
    notificationRecipientData: AccountNotificationData,
    triggerData: NotificationEventDataForSubstrateAccountDto
  ) {
    switch (triggerData.eventName) {
      case EventName.CommentReplyCreated:
        await this.bot.telegram.sendMessage(
          notificationRecipientData.notificationServiceAccountId,
          this.getTextToCommentReplyCreated(triggerData),
          this.getKeyboardWithRedirectInlineButton(
            'Check hear 👉',
            `${this.xSocialConfig.TELEGRAM_BOT_GRILL_REDIRECTION_HREF}/${triggerData.post.rootPost.space.id}/${triggerData.post.rootPost.id}/${triggerData.post.id}`
          )
        );
        break;

      case EventName.ExtensionDonationCreated:
        await this.bot.telegram.sendMessage(
          notificationRecipientData.notificationServiceAccountId,
          this.getTextToExtensionDonationCreated(triggerData),
          this.getKeyboardWithRedirectInlineButton(
            'Check hear 👉',
            `${this.xSocialConfig.TELEGRAM_BOT_GRILL_REDIRECTION_HREF}/${triggerData.post.rootPost.space.id}/${triggerData.post.rootPost.id}/${triggerData.post.id}`
          )
        );
        break;
      default:
    }
  }

  getTextToCommentReplyCreated(
    triggerData: NotificationEventDataForSubstrateAccountDto
  ) {
    const postText = triggerData.post.summary || triggerData.post.body;
    return `↪️ New reply to your message${postText ? `:\n"${postText}"` : '.'}
    `;
  }

  getTextToExtensionDonationCreated(
    triggerData: NotificationEventDataForSubstrateAccountDto
  ) {
    const postText =
      triggerData.extension.parentPost.summary ||
      triggerData.extension.parentPost.body;
    return `🤑 You received new donation of ${this.commonUtils.decorateDonationAmount(
      triggerData.extension.amount,
      triggerData.extension.decimals
    )} ${triggerData.extension.token}${
      postText ? ` w/ message: \n"${postText}"` : '!'
    }
    `;
  }

  getKeyboardWithRedirectInlineButton(
    text: string,
    url: string
  ): Markup.Markup<InlineKeyboardMarkup> {
    return Markup.inlineKeyboard([Markup.button.url(text, url)]);
  }
}
