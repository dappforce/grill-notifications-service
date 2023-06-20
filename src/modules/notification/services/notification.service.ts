import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { NotificationEventDataForSubstrateAccountDto } from '../dto/notificationEventTriggerData.dto';
import { xSocialConfig } from '../../../config';
import { AccountsLinkService } from '../../accountsLink/services/accountsLink.service';
import { NotificationSettingsService } from '../../notificationSettings/services/notificationSettings.service';
import { AccountsLink } from '../../accountsLink/typeorm/accountsLink.entity';
import {
  NotificationSettings,
  NotificationSubscription
} from '../../notificationSettings/typeorm/notificationSettings.entity';

import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { TelegrafContext } from '../../../interfaces/context.interface';
import { GrillNotificationsBotName } from '../../../app.constants';
import { NotificationSendersHelper } from '../notificationSenders/notificationSenders.helper';
import { AccountNotificationData } from '../dto/types';

@Injectable()
export class NotificationService {
  constructor(
    private readonly xSocialConfig: xSocialConfig,
    private readonly accountsLinkService: AccountsLinkService,
    private readonly notificationSettingsService: NotificationSettingsService,
    private readonly notificationSendersHelper: NotificationSendersHelper,
    @InjectBot(GrillNotificationsBotName) private bot: Telegraf<TelegrafContext>
  ) {}

  async handleNotificationEventForSubstrateAccount(
    triggerData: NotificationEventDataForSubstrateAccountDto
  ) {
    const activeAccountsLinks =
      await this.accountsLinkService.findAllActiveBySubstrateAccountId(
        triggerData.substrateAccountId
      );

    if (activeAccountsLinks.length === 0) return;

    const accountNotificationData = new Map<string, AccountNotificationData>();

    for (const link of activeAccountsLinks) {
      let accNotificationSettings =
        await this.notificationSettingsService.findByAccountId(
          link.substrateAccountId
        );
      if (!accNotificationSettings) {
        accNotificationSettings =
          await this.notificationSettingsService.createToAccount({
            substrateAccountId: link.substrateAccountId,
            subscriptions:
              this.notificationSettingsService.getDefaultNotificationSubscriptions()
          });
      }
      accountNotificationData.set(link.substrateAccountId, {
        ...link,
        notificationSettings: accNotificationSettings
      });
    }

    for (const accountData of [...accountNotificationData.values()]) {
      const eventSubscriptionData =
        accountData.notificationSettings.subscriptions.find(
          (sub) => sub.eventName === triggerData.eventName
        );
      // If account doesn't have subscription to current event, we skip notification.
      if (!eventSubscriptionData) continue;

      await this.processEventSubscription(
        eventSubscriptionData,
        accountData,
        triggerData
      );
    }
  }

  async processEventSubscription(
    eventSubscriptionData: NotificationSubscription,
    notificationRecipientData: AccountNotificationData,
    triggerData: NotificationEventDataForSubstrateAccountDto
  ) {
    if (eventSubscriptionData.telegramBot) {
      await this.notificationSendersHelper.sendMessageTelegramBot(
        notificationRecipientData,
        triggerData
      );
    }
  }
}
