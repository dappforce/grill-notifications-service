import { Injectable } from '@nestjs/common';
import { AccountsLinkService } from '../../accountsLink/services/accountsLink.service';
import { NotificationSettingsService } from '../../notificationSettings/services/notificationSettings.service';
import { InjectBot } from 'nestjs-telegraf';
import { GrillNotificationsBotName } from '../../../app.constants';
import { Markup, Telegraf } from 'telegraf';
import { TelegrafContext } from '../../../interfaces/context.interface';
import { NotificationEventDataForSubstrateAccountDto } from '../dto/notificationEventTriggerData.dto';
import { AccountNotificationData } from '../dto/types';
import { EventName } from '../../dataProviders/dto/squid/squidEvents.dto';
import { CommonUtils } from '../../../common/utils/common.util';

@Injectable()
export class NotificationSendersHelper {
  constructor(
    @InjectBot(GrillNotificationsBotName)
    private bot: Telegraf<TelegrafContext>,
    private commonUtils: CommonUtils
  ) {}

  async sendMessageTelegramBot(
    notificationRecipientData: AccountNotificationData,
    triggerData: NotificationEventDataForSubstrateAccountDto
  ) {
    switch (triggerData.eventName) {
      case EventName.CommentReplyCreated:
        await this.bot.telegram.sendMessage(
          notificationRecipientData.tgAccountId,
          this.getTextToCommentReplyCreated(triggerData),
          Markup.inlineKeyboard([
            Markup.button.url(
              'Check hear.',
              `https://grill.chat/${triggerData.post.rootPost.space.id}/${triggerData.post.rootPost.id}/${triggerData.post.id}`
            )
          ])
        );
        break;

      case EventName.ExtensionDonationCreated:
        await this.bot.telegram.sendMessage(
          notificationRecipientData.tgAccountId,
          this.getTextToExtensionDonationCreated(triggerData),
          Markup.inlineKeyboard([
            Markup.button.url(
              'Check hear.',
              `https://grill.chat/${triggerData.post.rootPost.space.id}/${triggerData.post.rootPost.id}/${triggerData.post.id}`
            )
          ])
        );
        break;
      default:
    }
  }

  getTextToCommentReplyCreated(
    triggerData: NotificationEventDataForSubstrateAccountDto
  ) {
    return `↪️ New reply to your message:
    "${triggerData.post.summary || triggerData.post.body}"
    `;
  }

  getTextToExtensionDonationCreated(
    triggerData: NotificationEventDataForSubstrateAccountDto
  ) {
    return `🤑 You received new donation of ${this.commonUtils.decorateDonationAmount(
      triggerData.extension.amount,
      triggerData.extension.decimals
    )} ${triggerData.extension.token}!
    `;
  }
}
