import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsLinkService } from './services/accountsLink.service';
import { AccountsLink } from './typeorm/accountsLink.entity';
import { CryptoUtils } from '../../common/utils/crypto.util';
import { AccountsLinkingGqlResolver } from './graphql/accountsLinking.gql.resolver';
import { TelegramAccountsLinkService } from './services/telegram.accountsLink.service';
import { TelegramAccount } from './typeorm/telegramAccount.entity';
import { TelegramTemporaryLinkingId } from './typeorm/telegramTemporaryLinkingId.entity';
import { CommonUtils } from '../../common/utils/common.util';

@Module({
  providers: [
    AccountsLinkService,
    TelegramAccountsLinkService,
    AccountsLinkingGqlResolver,
    CryptoUtils,
    CommonUtils
  ],
  imports: [
    TypeOrmModule.forFeature([
      AccountsLink,
      TelegramAccount,
      TelegramTemporaryLinkingId
    ])
  ],
  exports: [AccountsLinkService, TelegramAccountsLinkService]
})
export class AccountsLinkModule {}
