import { forwardRef, Module } from '@nestjs/common';
import { NotificationsChannel } from './controller/notificationsChannel.update';
import { EnvModule } from '../../config';
import { AccountsLinkModule } from '../accountsLink/accountsLink.module';
import { NotificationSettingsModule } from '../notificationSettings/notificationSettings.module';
import { TgBotSceneHelpers } from './scenes/utils';
import { LinkAccountsScene } from './scenes/linkAccounts.scene';

@Module({
  providers: [NotificationsChannel, LinkAccountsScene, TgBotSceneHelpers],
  imports: [
    // forwardRef(() => ModeratorModule),
    AccountsLinkModule,
    NotificationSettingsModule,
    EnvModule
  ]
})
export class TelegramBotModule {}
