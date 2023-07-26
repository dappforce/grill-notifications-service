import { NotificationServiceName } from '../../typeorm/accountsLink.entity';

export class EnsureAccountLinkInputDto {
  notificationServiceName: NotificationServiceName;
  notificationServiceAccountId: string;
  fcmTokens?: string[];
  substrateAccountId: string;
  keepExistingActiveStatus?: boolean;
  following: boolean;
  active?: boolean;
}
