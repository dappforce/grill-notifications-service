import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { GrillNotificationsBotName } from '../../../app.constants';
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
    @InjectBot(GrillNotificationsBotName)
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
        let checkUrl: string | undefined = undefined;
        try {
          checkUrl = `${this.xSocialConfig.TELEGRAM_BOT_GRILL_REDIRECTION_HREF}/${triggerData.post.rootPost.space.id}/${triggerData.post.rootPost.id}/${triggerData.post.id}`;
        } catch (e) {
          console.log(e);
        }
        await this.bot.telegram.sendMessage(
          notificationRecipientData.notificationServiceAccountId,
          this.getTextToCommentReplyCreated(triggerData),
          {
            parse_mode: 'MarkdownV2',
            reply_markup: checkUrl
              ? this.getKeyboardWithRedirectInlineButton([
                  { text: 'Check here 👉', url: checkUrl }
                ])
              : undefined
          }
        );
        break;
      }

      case EventName.ExtensionDonationCreated: {
        let checkUrl: string | undefined = undefined;
        try {
          checkUrl = `${this.xSocialConfig.TELEGRAM_BOT_GRILL_REDIRECTION_HREF}/${triggerData.post.rootPost.space.id}/${triggerData.post.rootPost.id}/${triggerData.post.id}`;
        } catch (e) {
          console.log(e);
        }
        const txExplorerUrl =
          this.commonNotificationSendersHelper.createTxExplorerUrlForDonation(
            triggerData.extension.txHash,
            triggerData.extension.chain
          );
        await this.bot.telegram.sendMessage(
          notificationRecipientData.notificationServiceAccountId,
          this.getTextToExtensionDonationCreated(triggerData),
          {
            parse_mode: 'MarkdownV2',
            reply_markup: checkUrl
              ? this.getKeyboardWithRedirectInlineButton([
                  { text: 'Check donation 👉', url: checkUrl },
                  ...(txExplorerUrl
                    ? [{ text: 'Explore transaction 🔎', url: txExplorerUrl }]
                    : [])
                ])
              : undefined
          }
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
    return this.escapeTelegramMarkdownText(
      `↪️ Someone replied to your message${
        originPostText ? `( ${originPostText} )` : ''
      }${replyPostText ? `:\n"${replyPostText}"` : '.'}`
    );
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
    // ): Markup.Markup<InlineKeyboardMarkup> {
  ): InlineKeyboardMarkup {
    return Markup.inlineKeyboard(
      buttonsList.map((btn) => Markup.button.url(btn.text, btn.url))
    ).reply_markup;
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
