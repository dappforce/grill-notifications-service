import { Module } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { AccountsLinkModule } from '../accountsLink/accountsLink.module';
import { NotificationSettingsModule } from '../notificationSettings/notificationSettings.module';
import { TelegramNotificationSendersHelper } from './notificationSenders/telegramNotificationSenders.helper';
import { CommonUtils } from '../../common/utils/common.util';
import { EnvModule } from '../../config';
import { CommonNotificationSendersHelper } from './notificationSenders/commonNotificationSenders.helper';
import { CryptoUtils } from '../../common/utils/crypto.util';
import { FcmSendersHelper } from './notificationSenders/fcmSenders.helper';

@Module({
  providers: [
    NotificationService,
    TelegramNotificationSendersHelper,
    FcmSendersHelper,
    CommonNotificationSendersHelper,
    CommonUtils,
    CryptoUtils
  ],
  imports: [AccountsLinkModule, NotificationSettingsModule, EnvModule],
  exports: [NotificationService]
})
export class NotificationModule {}
