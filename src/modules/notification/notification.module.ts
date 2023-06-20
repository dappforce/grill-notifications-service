import { Module, forwardRef } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { AccountsLinkModule } from '../accountsLink/accountsLink.module';
import { NotificationSettingsModule } from '../notificationSettings/notificationSettings.module';
import { NotificationSendersHelper } from './notificationSenders/notificationSenders.helper';
import { CommonUtils } from '../../common/utils/common.util';
import { EnvModule } from '../../config';

@Module({
  providers: [NotificationService, NotificationSendersHelper, CommonUtils],
  imports: [AccountsLinkModule, NotificationSettingsModule, EnvModule],
  exports: [NotificationService]
})
export class NotificationModule {}
