import { Module, forwardRef } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { AccountsLinkModule } from '../accountsLink/accountsLink.module';
import { NotificationSettingsModule } from '../notificationSettings/notificationSettings.module';
import { TelegramNotificationSendersHelper } from './notificationSenders/telegramNotificationSenders.helper';
import { CommonUtils } from '../../common/utils/common.util';
import { EnvModule } from '../../config';

@Module({
  providers: [NotificationService, TelegramNotificationSendersHelper, CommonUtils],
  imports: [AccountsLinkModule, NotificationSettingsModule, EnvModule],
  exports: [NotificationService]
})
export class NotificationModule {}
