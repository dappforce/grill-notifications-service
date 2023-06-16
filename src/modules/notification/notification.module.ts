import { Module, forwardRef } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { AccountsLinkModule } from '../accountsLink/accountsLink.module';
import { NotificationSettingsModule } from '../notificationSettings/notificationSettings.module';
import { NotificationSendersHelper } from './services/notificationSenders.helper';
import { CommonUtils } from '../../common/utils/common.util';

@Module({
  providers: [NotificationService, NotificationSendersHelper, CommonUtils],
  imports: [AccountsLinkModule, NotificationSettingsModule],
  exports: [NotificationService]
})
export class NotificationModule {}
