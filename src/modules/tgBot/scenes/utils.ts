import { Injectable } from '@nestjs/common';
import { AccountsLinkService } from '../../accountsLink/services/accountsLink.service';
import { NotificationSettingsService } from '../../notificationSettings/services/notificationSettings.service';

@Injectable()
export class TgBotSceneHelpers {
  constructor(
    private blockedResourceService: AccountsLinkService,
    private blockReasonService: NotificationSettingsService
  ) {}

  getHubsListLabel(hubs: string[]): string {
    return `hub${hubs.length > 1 ? 's' : ''}`;
  }
}
