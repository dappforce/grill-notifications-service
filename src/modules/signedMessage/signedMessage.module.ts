import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignatureNonceService } from './services/signatureNonce.service';
import { SignatureNonce } from './typeorm/signatureNonce.entity';
import { SignedMessageService } from './services/signedMessage.service';
import { SignedMessageGqlResolver } from './graphql/signedMessage.gql.resolver';
import { TelegramAccountsLinkService } from '../accountsLink/services/telegram.accountsLink.service';
import { AccountsLinkService } from '../accountsLink/services/accountsLink.service';
import { AccountsLinkModule } from '../accountsLink/accountsLink.module';
import { CryptoUtils } from '../../common/utils/crypto.util';
import { AccountsLink } from '../accountsLink/typeorm/accountsLink.entity';
import { TelegramAccount } from '../accountsLink/typeorm/telegramAccount.entity';
import { TelegramTemporaryLinkingId } from '../accountsLink/typeorm/telegramTemporaryLinkingId.entity';
import { CommonUtils } from '../../common/utils/common.util';

@Global()
@Module({
  providers: [
    SignatureNonceService,
    SignedMessageService,
    SignedMessageGqlResolver,
    TelegramAccountsLinkService,
    AccountsLinkService,
    CryptoUtils,
    CommonUtils
  ],
  imports: [
    TypeOrmModule.forFeature([
      SignatureNonce,
      AccountsLink,
      TelegramAccount,
      TelegramTemporaryLinkingId
    ]),
    AccountsLinkModule
  ],
  exports: [SignatureNonceService, SignedMessageService]
})
export class SignedMessageModule {}
