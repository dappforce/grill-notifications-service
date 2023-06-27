import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { GRILL_NOTIFICATIONS_BOT_NAME } from '../../../app.constants';
import { Markup, Telegraf, Format } from 'telegraf';
import { TelegrafContext } from '../../../interfaces/context.interface';
import { NotificationEventDataForSubstrateAccountDto } from '../dto/notificationEventTriggerData.dto';
import { AccountNotificationData } from '../dto/types';
import { EventName } from '../../dataProviders/dto/squid/squidEvents.dto';
import { CommonUtils } from '../../../common/utils/common.util';
import { InlineKeyboardMarkup } from 'typegram';
import { xSocialConfig } from '../../../config';
import { CommonNotificationSendersHelper } from './commonNotificationSenders.helper';

@Injectable()
export class TelegramNotificationSendersHelper {
  constructor(
    @InjectBot(GRILL_NOTIFICATIONS_BOT_NAME)
    private bot: Telegraf<TelegrafContext>,
    private commonUtils: CommonUtils,
    private commonNotificationSendersHelper: CommonNotificationSendersHelper,
    private readonly xSocialConfig: xSocialConfig
  ) {}

  async sendMessageTelegramBot(
    notificationRecipientData: AccountNotificationData,
    triggerData: NotificationEventDataForSubstrateAccountDto
  ) {
    switch (triggerData.eventName) {
      case EventName.CommentReplyCreated: {
        let checkUrl =
          this.commonNotificationSendersHelper.createPostUrlFromNotificationTriggerData(
            triggerData
          );
        await this.bot.telegram.sendMessage(
          notificationRecipientData.notificationServiceAccountId,
          this.getTextToCommentReplyCreated(triggerData),
          checkUrl
            ? this.getKeyboardWithRedirectInlineButton([
                { text: 'Check here 👉', url: checkUrl }
              ])
            : undefined
        );
        break;
      }

      case EventName.ExtensionDonationCreated: {
        let checkUrl =
          this.commonNotificationSendersHelper.createPostUrlFromNotificationTriggerData(
            triggerData
          );
        const txExplorerUrl =
          this.commonNotificationSendersHelper.createTxExplorerUrlForDonation(
            triggerData.extension.txHash,
            triggerData.extension.chain
          );
        await this.bot.telegram.sendMessage(
          notificationRecipientData.notificationServiceAccountId,
          this.getTextToExtensionDonationCreated(triggerData),
          checkUrl
            ? this.getKeyboardWithRedirectInlineButton([
                { text: 'Check donation 👉', url: checkUrl },
                ...(txExplorerUrl
                  ? [{ text: 'Transaction info 🧾', url: txExplorerUrl }]
                  : [])
              ])
            : undefined
        );
        break;
      }
      default:
    }
  }

  getTextToCommentReplyCreated(
    triggerData: NotificationEventDataForSubstrateAccountDto
  ) {
    const originPostText =
      triggerData.post.parentPost.summary || triggerData.post.parentPost.body;

    const replyPostText = triggerData.post.summary || triggerData.post.body;
    return `↪️ Someone replied to your message${
      originPostText ? `( ${originPostText} )` : ''
    }${replyPostText ? `:\n"${replyPostText}"` : '.'}`;
  }

  getTextToExtensionDonationCreated(
    triggerData: NotificationEventDataForSubstrateAccountDto
  ) {
    const postText =
      triggerData.extension.parentPost.summary ||
      triggerData.extension.parentPost.body;

    return `🤑 You received a donation of ${this.commonUtils.decorateDonationAmount(
      triggerData.extension.amount,
      triggerData.extension.decimals
    )} ${triggerData.extension.token}${
      postText ? ` with the following message: \n"${postText}".` : '!'
    }
    `;
  }

  getKeyboardWithRedirectInlineButton(
    buttonsList: {
      text: string;
      url: string;
    }[]
  ): Markup.Markup<InlineKeyboardMarkup> {
    // ): InlineKeyboardMarkup {
    return Markup.inlineKeyboard(
      buttonsList.map((btn) => Markup.button.url(btn.text, btn.url))
    );
  }

  escapeTelegramMarkdownText(text) {
    const SPECIAL_CHARS = [
      '\\',
      '_',
      '*',
      '[',
      ']',
      '(',
      ')',
      '~',
      '`',
      '>',
      '<',
      '&',
      '#',
      '+',
      '-',
      '=',
      '|',
      '{',
      '}',
      '.',
      '!'
    ];

    SPECIAL_CHARS.forEach(
      (char) => (text = text.replaceAll(char, `\\${char}`))
    );
    return text;
  }
}
