import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsLinkService } from './services/accountsLink.service';
import { AccountsLink } from './typeorm/accountsLink.entity';
import { CryptoUtils } from '../../common/utils/crypto.util';
import {AccountsLinkingGqlResolver} from "./graphql/accountsLinking.gql.resolver";

@Module({
  providers: [AccountsLinkService, AccountsLinkingGqlResolver, CryptoUtils],
  imports: [TypeOrmModule.forFeature([AccountsLink])],
  exports: [AccountsLinkService]
})
export class AccountsLinkModule {}
