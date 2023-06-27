import { AccountsLink } from '../typeorm/accountsLink.entity';

export class ProcessLinkingIdOrAddressResponseTelegramDto {
  entity: Omit<AccountsLink, '_id'>;
  existing: boolean;
  success: boolean;
  message?: string;
}
