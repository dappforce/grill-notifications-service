import { NotificationServiceName } from '../typeorm/accountsLink.entity';

export class EnsureAccountLinkInputDto {
  notificationServiceName: NotificationServiceName;
  notificationServiceAccountId: string;
  substrateAccountId: string;
  following: boolean;
  active?: boolean;
}
