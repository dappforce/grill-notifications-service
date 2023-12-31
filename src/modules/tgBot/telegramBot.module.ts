import { Module } from '@nestjs/common';
import { NotificationsChannel } from './controller/notificationsChannel.update';
import { EnvModule } from '../../config';
import { AccountsLinkModule } from '../accountsLink/accountsLink.module';
import { NotificationSettingsModule } from '../notificationSettings/notificationSettings.module';
import { TgBotSceneHelpers } from './scenes/utils';
import { LinkAccountsScene } from './scenes/linkAccounts.scene';
import { StatusScene } from './scenes/status.scene';
import { UnlinkAccountsScene } from './scenes/unlinkAccounts.scene';
import { CryptoUtils } from '../../common/utils/crypto.util';

@Module({
  providers: [
    NotificationsChannel,
    LinkAccountsScene,
    UnlinkAccountsScene,
    StatusScene,
    TgBotSceneHelpers,
    CryptoUtils
  ],
  imports: [AccountsLinkModule, NotificationSettingsModule, EnvModule]
})
export class TelegramBotModule {}
