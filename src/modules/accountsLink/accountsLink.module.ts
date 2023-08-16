import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsLinkService } from './services/accountsLink.service';
import { AccountsLink } from './typeorm/accountsLink.entity';
import { CryptoUtils } from '../../common/utils/crypto.util';
import { AccountsLinkingGqlResolver } from './graphql/accountsLinking.gql.resolver';
import { TelegramAccountsLinkService } from './services/telegram.accountsLink.service';
import { TelegramAccount } from './typeorm/telegramAccount.entity';
import { TelegramTemporaryLinkingId } from './typeorm/telegramTemporaryLinkingId.entity';
import { CommonUtils } from '../../common/utils/common.util';
import { SignatureNonceService } from '../signedMessage/services/signatureNonce.service';
import { SignatureNonce } from '../signedMessage/typeorm/signatureNonce.entity';
import { FcmAccountsLinkService } from './services/fcm.accountsLink.service';

@Module({
  providers: [
    AccountsLinkService,
    TelegramAccountsLinkService,
    AccountsLinkingGqlResolver,
    CryptoUtils,
    CommonUtils,
    SignatureNonceService,
    FcmAccountsLinkService
  ],
  imports: [
    TypeOrmModule.forFeature([
      AccountsLink,
      TelegramAccount,
      TelegramTemporaryLinkingId,
      SignatureNonce
    ])
  ],
  exports: [
    AccountsLinkService,
    TelegramAccountsLinkService,
    FcmAccountsLinkService
  ]
})
export class AccountsLinkModule {}
