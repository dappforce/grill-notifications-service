import { Injectable } from '@nestjs/common';
import { NotificationEventDataForSubstrateAccountDto } from '../dto/notificationEventTriggerData.dto';
import { xSocialConfig } from '../../../config';
import { AccountsLinkService } from '../../accountsLink/services/accountsLink.service';
import { NotificationSettingsService } from '../../notificationSettings/services/notificationSettings.service';
import { NotificationServiceName } from '../../accountsLink/typeorm/accountsLink.entity';
import { NotificationSubscription } from '../../notificationSettings/typeorm/notificationSettings.entity';

import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { TelegrafContext } from '../../../interfaces/context.interface';
import { GRILL_NOTIFICATIONS_BOT_NAME } from '../../../app.constants';
import { TelegramNotificationSendersHelper } from '../notificationSenders/telegramNotificationSenders.helper';
import { AccountNotificationData } from '../dto/types';
import { FcmSendersHelper } from '../notificationSenders/fcmSenders.helper';

@Injectable()
export class NotificationService {
  constructor(
    private readonly xSocialConfig: xSocialConfig,
    private readonly accountsLinkService: AccountsLinkService,
    private readonly notificationSettingsService: NotificationSettingsService,
    private readonly telegramNotificationSendersHelper: TelegramNotificationSendersHelper,
    private readonly fcmSendersHelper: FcmSendersHelper,
    @InjectBot(GRILL_NOTIFICATIONS_BOT_NAME)
    private bot: Telegraf<TelegrafContext>
  ) {}

  async handleNotificationEventForSubstrateAccount(
    triggerData: NotificationEventDataForSubstrateAccountDto
  ) {
    const activeAccountsLinks =
      await this.accountsLinkService.findAllActiveBySubstrateAccountId(
        triggerData.substrateAccountId
      );

    if (activeAccountsLinks.length === 0) return;

    const accountNotificationDataMap = new Map<
      string,
      AccountNotificationData
    >();

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
      // TODO "notificationServiceAccountId" should be changed in case switching to One-to-Mane linking schema.
      accountNotificationDataMap.set(link.notificationServiceAccountId, {
        ...link,
        notificationSettings: accNotificationSettings
      });
    }

    for (const accountLinkDataWithSettings of [
      ...accountNotificationDataMap.values()
    ]) {
      const accountEventSubscriptionSetting =
        accountLinkDataWithSettings.notificationSettings.subscriptions.find(
          (sub) => sub.eventName === triggerData.eventName
        );
      // If account doesn't have subscription to current event, we skip notification.
      if (!accountEventSubscriptionSetting) continue;

      /**
       * accountEventSubscriptionSetting - user's notification settings for specific on-chain event (triggerData.eventName)
       * accountLinkDataWithSettings - full user's notification settings (entity NotificationSettings)
       * triggerData - on-chain data from the indexer
       *
       */

      switch (accountLinkDataWithSettings.notificationServiceName) {
        case NotificationServiceName.telegram: {
          if (accountEventSubscriptionSetting.telegramBot) {
            await this.telegramNotificationSendersHelper.sendMessageTelegramBot(
              accountLinkDataWithSettings,
              triggerData
            );
          }
          break;
        }
        case NotificationServiceName.fcm: {
          if (accountEventSubscriptionSetting.fcm) {
            await this.fcmSendersHelper.sendMessageFcm(
              accountLinkDataWithSettings,
              triggerData
            );
          }
          break;
        }
      }
    }
  }

  // async processAccountEventSubscription(
  //   eventSubscriptionData: NotificationSubscription,
  //   notificationRecipientData: AccountNotificationData,
  //   triggerData: NotificationEventDataForSubstrateAccountDto
  // ) {
  //   /**
  //    * Check if this particular accountsLink (notificationRecipientData) is
  //    */
  //   if (
  //     eventSubscriptionData.telegramBot &&
  //     notificationRecipientData.notificationServiceName ===
  //       NotificationServiceName.telegram
  //   ) {
  //     await this.telegramNotificationSendersHelper.sendMessageTelegramBot(
  //       notificationRecipientData,
  //       triggerData
  //     );
  //   }
  // }
}
