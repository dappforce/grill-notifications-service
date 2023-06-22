import { TelegramAccount } from '../typeorm/telegramAccount.entity';

export class ProcessLinkingIdInputTelegramDto {
  telegramAccountData: Omit<TelegramAccount, '_id'>;
  linkingId: string;
}
